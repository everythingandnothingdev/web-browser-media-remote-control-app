<template>
    <ion-page>
        <ion-content>
            
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '@/store';
import router from '@/router';
export default defineComponent({
    mounted() {
        if (store.state.mqttCredentials) {
            router.replace({ name: 'remote' });
        } else {
            router.replace({ name: 'setup-mqtt' });
        }
    }
});
</script>
