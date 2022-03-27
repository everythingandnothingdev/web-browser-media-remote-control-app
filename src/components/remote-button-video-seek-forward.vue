<template>
    <button class="remote-button" @pointerdown="onClickButton()">
        <ion-icon :icon="icon"/>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { playSkipForward } from 'ionicons/icons';
import { publish as mqttPublish } from '@/services/mqtt-client';

export default defineComponent({
    name: 'remote-button-video-seek-forward',
    setup(props) {
        function onClickButton() {
            mqttPublish('primaryVideo/seekForward', JSON.stringify({ ms: 5000 }));
        }

        return { onClickButton, icon: playSkipForward };
    }
});
</script>
