<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>MQTT Host</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="dismissModal()">Close</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <h2>Are you using our MQTT Broker?</h2>
            <p>
                If you are using <a :href="mqttBrokerDownloadUrl" target="_system">our MQTT Broker</a>, the host you need to enter here will be displayed on the main window when the MQTT Broker is started.
            </p>
            <h2>Have you installed your own MQTT Broker?</h2>
            <p>
                If you've already installed your own MQTT Broker, you likely already know the internal IP address of the machine it's running on. You will enter that here, e.g:
                <span class="ion-text-center"><code>192.168.1.10</code></span>
            </p>
            <p>
                If you don't know the internal IP address, you can find by <a href="https://www.lifewire.com/accessing-your-router-at-home-818205" target="_system">looking at the DHCP leases</a> in your internet router's administration page.
                You can also find it by looking at the <a href="https://www.whatismybrowser.com/detect/what-is-my-local-ip-address" target="_system">network interface settings</a> on the computer that is running the MQTT Broker.
            </p>
            <h2>Are you using a cloud-based MQTT Broker?</h2>
            <p>
                If so, you will need to get this information from the cloud service you are using. They should have it readily available, it will look like a website URL, e.g. <code>mqtt.example.com</code>
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
