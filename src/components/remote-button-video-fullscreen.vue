<template>
    <button class="remote-button" @pointerdown="onClickButton()">
        <ion-icon :icon="icon"/>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { tvOutline } from 'ionicons/icons';
import { publish as mqttPublish } from '@/services/mqtt-client';

export default defineComponent({
    name: 'remote-button-video-fullscreen',
    setup(props) {
        function onClickButton() {
            mqttPublish('window/fullscreen', '{}');
            mqttPublish('primaryVideo/toggleFullscreen', '{}');
        }

        return { onClickButton, icon: tvOutline };
    }
});
</script>
