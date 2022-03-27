<template>
    <ion-header>
        <ion-toolbar>
            <ion-title>Browser Tabs</ion-title>
        </ion-toolbar>
    </ion-header>
    <ion-content>
        <ion-list ref="tabIonList" lines="full">
            <ion-item-sliding v-for="browserTab of browserTabs" :key="browserTab.id" button>
                <ion-item :color="browserTab.active ? 'light' : null" button detail @click="onClickActivateTab(browserTab.id)">
                    <ion-label>
                        {{ browserTab.title }}
                    </ion-label>
                </ion-item>
                <ion-item-options side="end">
                    <ion-item-option color="light" @click="onClickRefreshTab(browserTab)">
                        <ion-icon :icon="refresh" />
                    </ion-item-option>
                    <ion-item-option color="light" @click="onClickUpdateTab(browserTab)">
                        <ion-icon :icon="create" />
                    </ion-item-option>
                    <ion-item-option color="danger" @click="onClickRemoveTab(browserTab.id)">
                        <ion-icon :icon="trash" />
                    </ion-item-option>
                </ion-item-options>
            </ion-item-sliding>
        </ion-list>
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
            <ion-fab-button id="create-tab-button" @click="isCreateTabPopoverOpen = true">
                <ion-icon :icon="add" />
            </ion-fab-button>
        </ion-fab>
        <ion-popover
            reference="event" :is-open="isCreateTabPopoverOpen"
            css-class="ion-popover-medium"
            @willPresent="isCreateTabPopoverOpen = true" @didDismiss="isCreateTabPopoverOpen = false"
        >
            <ion-content class="ion-padding">
                <div style="display: flex;">
                    <ion-item style="flex-grow: 1;">
                        <ion-label position="stacked">Website Address</ion-label>
                        <ion-input v-model="createTabUrl" :placeholder="createTabUrlPlaceholder" />
                    </ion-item>
                    <ion-button style="flex-shrink: 1; align-self: flex-end;" @click="onClickCreateTab()">Go</ion-button>
                </div>
            </ion-content>
        </ion-popover>
    </ion-content>
</template>

<script lang="ts">
import { defineComponent, onMounted, toRefs, ref } from 'vue';
import { add, create, refresh, trash } from 'ionicons/icons';
import { publish as mqttPublish } from '@/services/mqtt-client';
import { menuController, IonList } from '@ionic/vue';
import { BrowserTab } from '@/types';
import store from '@/store';

export default defineComponent({
    components: {
    },
    setup() {
        const tabIonList = ref<any>();
        const isCreateTabPopoverOpen = ref<boolean>(false);
        const createTabUrl = ref<string>('');
        const createTabUrlPlaceholder = ref<string>('');
        const updatingTabId = ref<number | null>(null);

        const { browserTabs } = toRefs(store.state);

        onMounted(() => {
            mqttPublish('tabs/requestList', '{}');
            mqttPublish('primaryVideo/requestInfo', '{}');
        });

        async function onClickActivateTab(tabId: number) {
            await mqttPublish('tabs/activate', JSON.stringify({ id: tabId }));
            await mqttPublish('primaryVideo/requestInfo', '{}');
        }

        function onClickUpdateTab(tab: BrowserTab) {
            updatingTabId.value = tab.id;
            createTabUrlPlaceholder.value = tab.url;
            createTabUrl.value = '';
            isCreateTabPopoverOpen.value = true;
        }

        function onClickRemoveTab(tabId: number) {
            mqttPublish('tabs/remove', JSON.stringify({ id: tabId }));
        }

        function onClickRefreshTab(tab: BrowserTab) {
            mqttPublish('tabs/update', JSON.stringify({ id: tab.id, url: tab.url }));
            tabIonList.value.$el.closeSlidingItems​();
        }

        function onClickCreateTab() {
            if (updatingTabId.value != null) {
                mqttPublish('tabs/update', JSON.stringify({ id: updatingTabId.value, url: createTabUrl.value }));
                tabIonList.value.$el.closeSlidingItems​();
            } else {
                mqttPublish('tabs/create', JSON.stringify({ url: createTabUrl.value }));
            }
            isCreateTabPopoverOpen.value = false;
            updatingTabId.value = null;
            createTabUrlPlaceholder.value = '';
            createTabUrl.value = '';
            menuController.close('browser-tabs');
        }

        return {
            tabIonList,
            isCreateTabPopoverOpen, createTabUrl, createTabUrlPlaceholder, updatingTabId,
            browserTabs,
            onClickActivateTab, onClickRefreshTab, onClickUpdateTab, onClickRemoveTab, onClickCreateTab,
            add, create, refresh, trash
        };
    }
});
</script>

<style lang="scss">

</style>