<template>
    <button class="remote-button" @pointerdown="onClickButton()">
        <ion-icon src="assets/images/zoom-out.svg" style="font-size: 1.6rem" />
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { publish as mqttPublish } from '@/services/mqtt-client';

export default defineComponent({
    name: 'remote-button-tab-zoom-out',
    setup(props) {
        function onClickButton() {
            mqttPublish('tabs/zoomOut', '{}');
        }

        return { onClickButton };
    }
});
</script>
