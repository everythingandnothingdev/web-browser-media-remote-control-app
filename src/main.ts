import { createApp } from 'vue';
import { IonicVue, alertController } from '@ionic/vue';
import { Plugins } from '@capacitor/core';
import store from '@/store';
import { publish as mqttPublish } from '@/services/mqtt-client';

import App from './app.vue';
import router from './router';

import './main.scss';
import '@ionic/core/css/ionic.bundle.css';

import components from './components/components.plugin';

const app = createApp(App);
app.use(IonicVue);
app.use(router);
app.use(components);
app.mount('#app');

(window as any).app = app;

const { SendIntent } = Plugins;

SendIntent.addListener('appSendActionIntent', async (data: any) => {
    if (data?.extras['android.intent.extra.TEXT']) {
        const link = data?.extras['android.intent.extra.TEXT'];
        const alert = await alertController.create({
            header: 'Open Link',
            message: 'Where would you like to open this link?<br>' + link,
            buttons: [
                {
                    text: 'Current Tab',
                    async handler() {
                        const activeTabId = store.state.browserTabs.filter(tab => tab.active)[0]?.id;
                        if (activeTabId) {
                            await mqttPublish('tabs/update', JSON.stringify({ id: activeTabId, url: link }));
                        } else {
                            if (!store.state.primaryVideoInfo.paused) {
                                await mqttPublish('primaryVideo/togglePlay', '{}');
                            }
                            await mqttPublish('tabs/create', JSON.stringify({ url: link }));
                        }
                    }
                },
                {
                    text: 'New Tab',
                    async handler() {
                        if (!store.state.primaryVideoInfo.paused) {
                            await mqttPublish('primaryVideo/togglePlay', '{}');
                        }
                        await mqttPublish('tabs/create', JSON.stringify({ url: link }));
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel'
                }
            ]
        });
        alert.present();
    }
});

