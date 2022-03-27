<template>
    <ion-page>
        <ion-content fullscreen scroll-y="false">
            <ion-slides ref="slides" pager="true" style="height: 100%">
                <ion-slide>
                    <div class="ion-padding">
                        <img src="assets/images/setup-intro.svg" alt="Phone, PC, and TV" />
                        <h2>Welcome</h2>
                        <p>This app works like a TV remote for <strong>Chrome</strong> or <strong>Firefox</strong>. It makes it easier to surf the web when using a PC that's connected to your TV.</p>
                        <ion-button fill="clear" class="ion-no-margin" @click="goNextSlide()">Let's Get Started <ion-icon :icon="chevronForwardCircleOutline" class="ion-margin-start ion-margin-tiny" /></ion-button>
                    </div>
                </ion-slide>
                <ion-slide>
                    <div class="ion-padding">
                        <img src="assets/images/setup-mqtt.svg" alt="MQTT connects everything together" />
                        <h2>MQTT Setup</h2>
                        <p>First you need to set up a MQTT Broker that will be used to communicate between this app and the web browser on your computer.</p>
                        <ion-button fill="clear" class="ion-no-margin" @click="goNextSlide()">I Already Have a MQTT Broker</ion-button><br>
                        <ion-button fill="clear" class="ion-no-margin" @click="openMqttFaq()">A What?</ion-button>
                    </div>
                </ion-slide>
                <ion-slide>
                    <form action="javascript:void(0)" class="ion-padding" style="width: 100%" @submit="onConnectMqtt()">
                        <img src="assets/images/mqtt.svg" alt="MQTT" style="height: 2rem" />
                        <h2 class="ion-no-margin">Enter Broker Info</h2>
                        <div class="ion-padding-end">
                            <ion-item>
                                <ion-label position="stacked">Protocol</ion-label>
                                <ion-select v-model.trim="mqttProtocol">
                                    <ion-select-option value="ws://">ws://</ion-select-option>
                                    <ion-select-option value="wss://">wss://</ion-select-option>
                                </ion-select>
                                <ion-button @click="openProtocolHelp()" slot="end" fill="clear" class="ion-align-self-end ion-no-padding ion-no-margin ion-margin-bottom ion-margin-small" title="Help with protocol">
                                    <ion-icon style="font-size: 1.5rem" :icon="helpCircle" />
                                </ion-button>
                            </ion-item>
                            <ion-item>
                                <ion-label position="stacked">Host</ion-label>
                                <ion-input v-model.trim="mqttHost" />
                                <ion-button @click="openHostHelp()" slot="end" fill="clear" class="ion-align-self-end ion-no-padding ion-no-margin ion-margin-bottom ion-margin-small" title="Help with host">
                                    <ion-icon style="font-size: 1.5rem" :icon="helpCircle" />
                                </ion-button>
                            </ion-item>
                            <ion-item>
                                <ion-label position="stacked">Port</ion-label>
                                <ion-input v-model.trim="mqttPort" />
                                <ion-button @click="openPortHelp()" slot="end" fill="clear" class="ion-align-self-end ion-no-padding ion-no-margin ion-margin-bottom ion-margin-small" title="Help with port">
                                    <ion-icon style="font-size: 1.5rem" :icon="helpCircle" />
                                </ion-button>
                            </ion-item>
                            <ion-item>
                                <ion-label position="stacked">Username</ion-label>
                                <ion-input v-model.trim="mqttUsername" />
                            </ion-item>
                            <ion-item>
                                <ion-label position="stacked">Password</ion-label>
                                <ion-input type="password" v-model.trim="mqttPassword" />
                            </ion-item>
                        </div>
                        <ion-button fill="clear" class="ion-no-margin" type="submit">Connect <ion-icon :icon="chevronForwardCircleOutline" class="ion-margin-start ion-margin-small" /></ion-button><br>
                    </form>
                </ion-slide>
            </ion-slides>
            <!-- MQTT Connecting Alert -->
            <ion-alert
                :is-open="isConnectingAlertShown"
                header="Connection Status"
                message="<div id=&quot;connectionStatusAlertMessage&quot;></div>"
                :buttons="[{ text: 'Cancel', role: 'cancel' }]"
                @didDismiss="onDismissConnectingAlert"
            ></ion-alert>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, ref, watch, nextTick } from 'vue';
import router from '@/router';
import { alertController, loadingController, modalController } from '@ionic/vue';
import { chevronForward, chevronForwardCircleOutline, helpCircle } from 'ionicons/icons';
import { connectionStatus, connectionStatusMessage, connect as mqttConnect, waitForConnected, end as mqttEnd } from '@/services/mqtt-client';
import { capitalize } from '@/filters';

export default defineComponent({
    setup() {
        const slides = ref<any>();
        const isLikelyUsingOurBroker = ref<boolean>(false);
        const mqttProtocol = ref<string>('ws://');
        const mqttHost = ref<string>('');
        const mqttPort = ref<string>('');
        const mqttUsername = ref<string>('');
        const mqttPassword = ref<string>('');
        const isConnectingAlertShown = ref<boolean>(false);
        let isConnectingAlertDismissedSuccess: boolean = false;

        watch([connectionStatus], () => {
            updateConnectionStatusAlert();
        });

        function updateConnectionStatusAlert() {
            const messageDiv = document.getElementById('connectionStatusAlertMessage');
            if (messageDiv) {
                messageDiv.textContent =
                    capitalize((connectionStatus.value === 'error' ? connectionStatusMessage.value : connectionStatus.value) || '') +
                    (['connecting', 'reconnecting'].includes(connectionStatus.value) ? '...' : '');
            }
        }

        function updateConnectionStatusAlertWhenAvailable() {
            const interval = setInterval(() => {
                const messageDiv = document.getElementById('connectionStatusAlertMessage');
                if (messageDiv) {
                    clearInterval(interval);
                    updateConnectionStatusAlert();
                }
            }, 50);
        }

        function goNextSlide() {
            slides.value?.$el?.swiper.slideNext();
        }

        async function openMqttFaq() {
            const modal = await modalController.create({
                component: defineAsyncComponent(() => import(/* webpackChunkName: 'faq-mqtt-broker' */ '@/views/faq-mqtt-broker.vue'))
            });
            await modal.present();
            isLikelyUsingOurBroker.value = true;
            mqttProtocol.value = 'ws://';
            mqttPort.value = '1884';
            const callbackData = await modal.onDidDismiss();
            if (callbackData.data?.installed) {
                goNextSlide();
            }
        }

        async function openProtocolHelp() {
            const modal = await modalController.create({
                component: defineAsyncComponent(() => import(/* webpackChunkName: 'faq-mqtt-protocol' */ '@/views/faq-mqtt-protocol.vue')),
                componentProps: {
                    isLikelyUsingOurBroker: isLikelyUsingOurBroker.value
                }
            });
            await modal.present();
        }

        async function openHostHelp() {
            const modal = await modalController.create({
                component: defineAsyncComponent(() => import(/* webpackChunkName: 'faq-mqtt-host' */ '@/views/faq-mqtt-host.vue')),
                componentProps: {
                    isLikelyUsingOurBroker: isLikelyUsingOurBroker.value
                }
            });
            await modal.present();
        }

        async function openPortHelp() {
            const modal = await modalController.create({
                component: defineAsyncComponent(() => import(/* webpackChunkName: 'faq-mqtt-port' */ '@/views/faq-mqtt-port.vue')),
                componentProps: {
                    usingProtocol: mqttProtocol.value,
                    isLikelyUsingOurBroker: isLikelyUsingOurBroker.value
                }
            });
            await modal.present();
        }

        async function onConnectMqtt() {
            isConnectingAlertDismissedSuccess = false;
            if (!mqttHost.value) {
                const alert = await alertController.create({
                    header: 'Host is Required',
                    message: 'Please fill out the Host field.',
                    buttons: ['OK']
                });
                alert.present();
                return;
            }
            if (!mqttPort.value) {
                const alert = await alertController.create({
                    header: 'Port is Required',
                    message: 'Please fill out the Port field.',
                    buttons: ['OK']
                });
                alert.present();
                return;
            }
            isConnectingAlertShown.value = true;
            await nextTick();
            updateConnectionStatusAlertWhenAvailable();
            mqttConnect({
                protocol: mqttProtocol.value,
                host: mqttHost.value,
                port: mqttPort.value,
                username: mqttUsername.value,
                password: mqttPassword.value
            });
            try {
                await waitForConnected();
                router.replace({ name: 'remote' });
            } catch (error) {
                const alert = await alertController.create({
                    header: 'Could Not Connect',
                    message: error.toString(),
                    buttons: ['OK']
                });
                alert.present();
            }
            isConnectingAlertDismissedSuccess = true;
            isConnectingAlertShown.value = false;
        }

        async function onDismissConnectingAlert(event: any) {
            isConnectingAlertShown.value = false;
            if (!isConnectingAlertDismissedSuccess) {
                mqttEnd();
            }
        }

        return {
            slides,
            isLikelyUsingOurBroker,
            isConnectingAlertShown,
            connectionStatus,
            connectionStatusMessage,
            mqttProtocol,
            mqttHost,
            mqttPort,
            mqttUsername,
            mqttPassword,
            chevronForward,
            chevronForwardCircleOutline,
            helpCircle,
            goNextSlide,
            onConnectMqtt,
            openMqttFaq,
            openProtocolHelp,
            openHostHelp,
            openPortHelp,
            onDismissConnectingAlert
        };
    }
});
</script>

<style lang="scss" scoped>
ion-slides {
    img {
        padding: 0 20px;
        max-height: 20rem;
    }
    p {
        color: var(--ion-color-step-600, #60646b);
        font-size: 1rem;
        line-height: 1.4;
    }
    ion-slide {
        overflow-y: auto;
    }
}
</style>