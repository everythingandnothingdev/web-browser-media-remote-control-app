<template>
    <button class="remote-button" @pointerdown="onClickButton()">
        <ion-icon :icon="isPlaying ? pause : play"/>
    </button>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { play, pause } from 'ionicons/icons';
import { publish as mqttPublish } from '@/services/mqtt-client';
import store from '@/store';

export default defineComponent({
    name: 'remote-button-video-play-pause',
    setup(props) {
        const { primaryVideoInfo } = toRefs(store.state);

        const isPlaying = computed<boolean>(() => {
            return !primaryVideoInfo.value.paused;
        });

        function onClickButton() {
            mqttPublish('primaryVideo/togglePlay', '{}');
        }

        return { onClickButton, primaryVideoInfo, isPlaying, play, pause };
    }
});
</script>
