<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>MQTT Port</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="dismissModal()">Close</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <h2>Are you using our MQTT Broker?</h2>
            <p>
                If you are using <a :href="mqttBrokerDownloadUrl" target="_system">our MQTT Broker</a>, the port you need to enter here will be {{ usingProtocol === 'ws://' ? 1884 : 8884 }}.
            </p>
            <h2>Have you installed your own MQTT Broker?</h2>
            <p>
                You will need to consult the documentation of the MQTT Broker you are using. The ports for the <code>ws://</code> and <code>wss://</code> protocol are different, so pay attention to that.
            </p>
            <h2>Are you using a cloud-based MQTT Broker?</h2>
            <p>
                You will need to get this information from the cloud service you are using. The ports for the <code>ws://</code> and <code>wss://</code> protocol are different, so pay attention to that.
            </p>
            <ion-button expand="block" fill="clear" @click="dismissModal()">Got it <ion-icon :icon="chevronForwardCircleOutline" class="ion-margin-start ion-margin-tiny" /></ion-button>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { modalController } from '@ionic/vue';
import { chevronForwardCircleOutline } from 'ionicons/icons';
import { mqttBrokerDownloadUrl } from '@/constants';

export default defineComponent({
    props: {
        usingProtocol: {
            type: String,
            default: 'ws://'
        },
        isLikelyUsingOurBroker: {
            type: Boolean,
            default: false
        }
    },
    setup() {
        function dismissModal(args: any) {
            modalController.dismiss(args);
        }

        return {
            mqttBrokerDownloadUrl,
            dismissModal,
            chevronForwardCircleOutline
        };
    }
});
</script>

<style scoped>
h2 {
    font-size: 1.2rem;
}
</style>
