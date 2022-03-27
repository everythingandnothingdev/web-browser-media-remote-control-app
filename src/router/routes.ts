import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/:catchAll(.*)',
        redirect: {
            name: 'app-start'
        }
    },
    {
        path: '/appStart',
        name: 'app-start',
        component: () => import(/* webpackChunkName: 'app-start' */ '../views/app-start.vue')
    },
    {
        path: '/setupMqtt',
        name: 'setup-mqtt',
        component: () => import(/* webpackChunkName: 'setup-mqtt' */ '../views/setup-mqtt.vue')
    },
    {
        path: '/remote',
        name: 'remote',
        component: () => import(/* webpackChunkName: 'remote' */ '../views/remote.vue')
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import(/* webpackChunkName: 'settings' */ '../views/settings.vue')
    }
];

export default routes;
