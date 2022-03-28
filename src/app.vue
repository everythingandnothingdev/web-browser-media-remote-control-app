<template>
    <ion-app id="app">
        <ion-router-outlet v-if="isReady" />
    </ion-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { eventBus } from '@/services/mqtt-client';
import store from '@/store';

export default defineComponent({
    setup() {
        const isReady = ref<boolean>(false);

        onMounted(async () => {
            await store.dispatch('initFromStorage');
            isReady.value = true;
        });

        eventBus.on('message', ({ topic, message }: any) => {
            if (topic === 'tabs/list') {
                store.dispatch('setBrowserTabs', JSON.parse(message));
            } else if (topic === 'primaryVideo/info') {
                store.dispatch('setPrimaryVideoInfo', JSON.parse(message));
            }
        });

        return {
            isReady
        };
    }
});
</script>
