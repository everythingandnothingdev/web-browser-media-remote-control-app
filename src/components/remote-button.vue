<template>
    <button class="remote-button">
        <ion-icon :icon="icon"/>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'remote-button',
    props: {
        icon: String
    },
    setup(props) {

    }
});
</script>

<style lang="scss">
.remote-button {
    background: #343434;
    border: .15rem solid #1d1d1d;
    box-shadow: inset .05rem -.1rem .2rem #464646;
    position: relative;
    border-radius: 1rem;
    display: block;
    color: white;
    width: 100%;
    height: 100%;

    &:active {
        background: #646464;
    }

    ion-icon {
        font-size: 1.8rem;
    }
}
</style>
