<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>About MQTT</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="dismissModal()">Close</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <p>
                You can use <a href="https://mqtt.org/software/" target="_system">any MQTT Broker software</a> you want, however we've built one for this project that is <strong>easy to install and use</strong>.
            </p>
            <p>
                On your <strong>PC that you'll be controlling with this remote app</strong>, download and run the MQTT Broker:
            </p>
            <ion-button expand="block" @click="shareDownloadLink()">Share Download Link to PC</ion-button>
            <ion-button expand="block" fill="outline" :href="mqttBrokerDownloadUrl" target="_system">Go to Download Page</ion-button>
            <p>
                Once you run this MQTT Broker program, it will show a window with the necessary information you need to enter in the next step on this app.
            </p>
            <p>
                You will want to keep this software running in the background at all times, so long as you plan to use the remote.
            </p>
            <ion-button expand="block" fill="clear" @click="dismissModal({ installed: true })">OK, it's installed! <ion-icon :icon="chevronForwardCircleOutline" class="ion-margin-start ion-margin-tiny" /></ion-button>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { alertController, modalController } from '@ionic/vue';
import { Share } from '@capacitor/share';
import { chevronForwardCircleOutline } from 'ionicons/icons';
import { mqttBrokerDownloadUrl } from '@/constants';

export default defineComponent({
    setup() {

        function dismissModal(args: any) {
            modalController.dismiss(args);
        }

        async function shareDownloadLink() {
            try {
                await Share.share({
                    url: mqttBrokerDownloadUrl
                });
            } catch (error) {
                const alert = await alertController.create({
                    header: 'Share Unavailable',
                    message: 'We\'re having trouble opening the share dialog. Please use the other button to go to the download page and send that download location to your PC.',
                    buttons: ['OK']
                });
                alert.present();
            }
        }

        return {
            mqttBrokerDownloadUrl,
            shareDownloadLink,
            dismissModal,
            chevronForwardCircleOutline
        };
    }
});
</script>
