import { createRouter, createWebHashHistory } from '@ionic/vue-router';
import routes from './routes';

let router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;

