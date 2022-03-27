import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';

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