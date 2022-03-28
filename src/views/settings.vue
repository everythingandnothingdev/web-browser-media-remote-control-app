<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Settings</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="onClickDone()">Done</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content fullscreen scroll-y="false">
            <form action="javascript:void(0)" class="ion-padding" style="width: 100%" @submit="onConnectMqtt()">
                <h2 class="ion-no-margin" style="display: flex; justify-content: center; align-items: center;"><img src="assets/images/mqtt.svg" alt="MQTT" style="height: 2rem" /> Broker Info</h2>
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
                    <ion-item>
                        <ion-label position="stacked">Topic Prefix</ion-label>
                        <ion-input type="text" v-model.trim="mqttTopicPrefix" />
                    </ion-item>
                </div>
                <ion-button fill="clear" class="ion-no-margin" type="submit">Connect <ion-icon :icon="chevronForwardCircleOutline" class="ion-margin-start ion-margin-small" /></ion-button><br>
            </form>
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
import { defineComponent, defineAsyncComponent, onMounted, ref, watch, nextTick } from 'vue';
import router from '@/router';
import { alertController, loadingController, modalController } from '@ionic/vue';
import { chevronForward, chevronForwardCircleOutline, helpCircle } from 'ionicons/icons';
import { connectionStatus, connectionStatusMessage, connect as mqttConnect, waitForConnected, end as mqttEnd } from '@/services/mqtt-client';
import { capitalize } from '@/filters';
import store from '@/store';

export default defineComponent({
    setup() {
        const isLikelyUsingOurBroker = ref<boolean>(false);
        const mqttProtocol = ref<string>('ws://');
        const mqttHost = ref<string>('');
        const mqttPort = ref<string>('');
        const mqttUsername = ref<string>('');
        const mqttPassword = ref<string>('');
        const mqttTopicPrefix = ref<string>('');
        const isConnectingAlertShown = ref<boolean>(false);
        let isConnectingAlertDismissedSuccess: boolean = false;

        watch([connectionStatus], () => {
            updateConnectionStatusAlert();
        });

        onMounted(() => {
            if (store.state.mqttCredentials) {
                mqttProtocol.value = store.state.mqttCredentials.protocol;
                mqttHost.value = store.state.mqttCredentials.host;
                mqttPort.value = store.state.mqttCredentials.port;
                mqttUsername.value = store.state.mqttCredentials.username;
                mqttPassword.value = store.state.mqttCredentials.password;
                mqttTopicPrefix.value = store.state.mqttCredentials.topicPrefix;
            }
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
                password: mqttPassword.value,
                topicPrefix: mqttTopicPrefix.value
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

        function onClickDone() {
            router.replace({ name: 'remote' });
        }

        return {
            isLikelyUsingOurBroker,
            isConnectingAlertShown,
            connectionStatus,
            connectionStatusMessage,
            mqttProtocol,
            mqttHost,
            mqttPort,
            mqttUsername,
            mqttPassword,
            mqttTopicPrefix,
            chevronForward,
            chevronForwardCircleOutline,
            helpCircle,
            onClickDone,
            onConnectMqtt,
            openProtocolHelp,
            openHostHelp,
            openPortHelp,
            onDismissConnectingAlert
        };
    }
});
</script>
