<template>
    <ion-page>
        <ion-menu side="start" menu-id="browser-tabs" content-id="remote">
            <browser-tabs-list />
        </ion-menu>
        <ion-content id="remote" class="remote-dnd" fullscreen scroll-y="false">
            <div style="display:flex; flex-direction: column; height: 100%;">
                <div ref="remoteGridContainer" style="display: flex; flex-grow: 1; align-items: center; justify-content: center; overflow: hidden;" class="ion-padding">
                    <div
                        :style="{
                            position: 'relative',
                            width: gridWidth + 'px',
                            height: gridHeight + 'px'
                        }"
                    >
                        <template v-for="(gridItem, i) of gridLayout" :key="i">
                            <div
                                :style="{
                                    position: 'absolute',
                                    left: ((gridItem.x * gridCellSizeX) + (gridItem.x * gridMargin)) + 'px',
                                    top: ((gridItem.y * gridCellSizeY) + (gridItem.y * gridMargin)) + 'px',
                                    width: ((gridItem.width * gridCellSizeX) + ((gridItem.width - 1) * gridMargin)) + 'px',
                                    height: ((gridItem.height * gridCellSizeY) + ((gridItem.height - 1) * gridMargin)) + 'px'
                                }"
                            >
                                <component :is="gridItem.component" :="gridItem.props" />
                            </div>
                        </template>
                    </div>
                </div>
                <div style="display: flex; flex-shrink: 0; justify-content: center; padding-top: 0;" class="ion-padding">
                    <ion-button color="light" fill="clear" aria-label="Browser Tabs" @click="onClickShowBrowserTabs()">
                        <ion-icon :icon="duplicate" />
                    </ion-button>
                    <!-- <ion-button color="light" fill="clear" aria-label="Search">
                        <ion-icon :icon="search" />
                    </ion-button> -->
                    <ion-button color="light" fill="clear" aria-label="Settings" @click="onClickGoSettings()">
                        <ion-icon :icon="settings" />
                    </ion-button>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch, nextTick } from 'vue';
import { duplicate, settings, tvOutline, playSkipBack, playSkipForward, search, volumeLow, volumeHigh } from 'ionicons/icons';
import { menuController, toastController } from '@ionic/vue';
import { connectionStatus } from '@/services/mqtt-client';
import router from '@/router';
import store from '@/store';

import BrowserTabsList from '@/components/browser-tabs-list.vue';
import RemoteButton from '@/components/remote-button.vue';
import RemoteButtonTabZoomIn from '@/components/remote-button-tab-zoom-in.vue';
import RemoteButtonTabZoomOut from '@/components/remote-button-tab-zoom-out.vue';
import RemoteButtonVideoFullscreen from '@/components/remote-button-video-fullscreen.vue';
import RemoteButtonVideoPlayPause from '@/components/remote-button-video-play-pause.vue';
import RemoteButtonVideoSeekForward from '@/components/remote-button-video-seek-forward.vue';
import RemoteButtonVideoSeekBackward from '@/components/remote-button-video-seek-backward.vue';
import RemoteTrackpad from '@/components/remote-trackpad.vue';
import RemoteArrowsOk from '@/components/remote-arrows-ok.vue';

interface GridLayoutItem {
    component: string,
    props?: any,
    x: number,
    y: number,
    width: number,
    height: number
}

export default defineComponent({
    components: {
        BrowserTabsList,
        RemoteButton,
        RemoteButtonTabZoomIn,
        RemoteButtonTabZoomOut,
        RemoteButtonVideoFullscreen,
        RemoteButtonVideoPlayPause,
        RemoteButtonVideoSeekForward,
        RemoteButtonVideoSeekBackward,
        RemoteTrackpad,
        RemoteArrowsOk
    },
    setup() {
        let disconnectedWarningToast: HTMLIonToastElement | null = null;

        const remoteGridContainer = ref<HTMLDivElement>();
        const gridMargin = ref<number>(16);
        const gridSizeX = ref<number>(5);
        const gridSizeY = ref<number>(10);
        const gridWidth = ref<number>(1);
        const gridHeight = ref<number>(1);
        const gridLayout = ref<GridLayoutItem[]>([
            {
                component: 'remote-trackpad',
                x: 0,
                y: 0,
                width: 5,
                height: 7
            },
            {
                component: 'remote-arrows-ok',
                x: 1,
                y: 7,
                width: 3,
                height: 3
            },
            {
                component: 'remote-button-tab-zoom-in',
                x: 0,
                y: 7,
                width: 1,
                height: 1
            },
            {
                component: 'remote-button-tab-zoom-out',
                x: 0,
                y: 8,
                width: 1,
                height: 1
            },
            {
                component: 'remote-button-video-fullscreen',
                x: 0,
                y: 9,
                width: 1,
                height: 1
            },
            {
                component: 'remote-button-video-seek-backward',
                x: 4,
                y: 7,
                width: 1,
                height: 1
            },
            {
                component: 'remote-button-video-seek-forward',
                x: 4,
                y: 8,
                width: 1,
                height: 1
            },
            {
                component: 'remote-button-video-play-pause',
                x: 4,
                y: 9,
                width: 1,
                height: 1
            }
        ]);

        const gridMarginlessWidth = computed(() => {
            return gridWidth.value - (gridMargin.value * (gridSizeX.value - 1));
        });
        const gridMarginlessHeight = computed(() => {
            return gridHeight.value - (gridMargin.value * (gridSizeY.value - 1));
        });
        const gridCellSizeX = computed(() => {
            return gridMarginlessWidth.value / gridSizeX.value;
        });
        const gridCellSizeY = computed(() => {
            return gridMarginlessHeight.value / gridSizeY.value;
        });

        watch([connectionStatus], async () => {
            if (connectionStatus.value === 'connected') {
                if (disconnectedWarningToast) {
                    disconnectedWarningToast.dismiss();
                }
            } else if (!disconnectedWarningToast) {
                disconnectedWarningToast = await toastController.create({
                    header: 'Connecting',
                    message: 'Please wait...',
                    position: 'top',
                    color: 'danger',
                    duration: 0
                });
                await disconnectedWarningToast.present();
            }
        });

        onMounted(async () => {
            await nextTick();
            const intervalHandle = setInterval(() => {
                if (remoteGridContainer.value) {
                    const computedStyle = window.getComputedStyle(remoteGridContainer.value);
                    const clientRect = remoteGridContainer.value.getBoundingClientRect();
                    const gridAreaWidth = clientRect.width - (parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight));
                    const gridAreaHeight = clientRect.height - (parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom));
                    if (gridAreaWidth / gridAreaHeight > gridSizeX.value / gridSizeY.value) {
                        gridHeight.value = gridAreaHeight;
                        gridWidth.value = gridAreaHeight * gridSizeX.value / gridSizeY.value;
                    } else {
                        gridWidth.value = gridAreaWidth;
                        gridHeight.value = gridAreaWidth * gridSizeY.value / gridSizeX.value;
                    }
                }
            }, 25);
            setTimeout(() => {
                clearInterval(intervalHandle);
            }, 2000);
        });

        function onClickShowBrowserTabs() {
            menuController.open('browser-tabs');
        }

        function onClickGoSettings() {
            router.replace({ name: 'settings' });
        }

        return {
            remoteGridContainer, gridSizeX, gridSizeY, gridLayout, gridCellSizeX, gridCellSizeY, gridWidth, gridHeight, gridMargin,
            onClickShowBrowserTabs, onClickGoSettings,
            duplicate, search, settings
        };
    }
});
</script>

<style lang="scss" scoped>
.remote-dnd {
    --background: linear-gradient(to right, #393939 0%, #212121 100%);
}
</style>