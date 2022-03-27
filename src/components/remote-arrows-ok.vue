<template>
    <div class="remote-arrows-ok">
        <button class="remote-arrows-ok__up" @pointerdown="onTapDirection('up')">
            <ion-icon :icon="chevronUp"/><br>
        </button>
        <button class="remote-arrows-ok__down" @pointerdown="onTapDirection('down')">
            <ion-icon :icon="chevronDown"/><br>
        </button>
        <button class="remote-arrows-ok__left" @pointerdown="onTapDirection('left')">
            <ion-icon :icon="chevronBack"/><br>
        </button>
        <button class="remote-arrows-ok__right" @pointerdown="onTapDirection('right')">
            <ion-icon :icon="chevronForward"/><br>
        </button>
        <button class="remote-arrows-ok__ok" @pointerdown="onTapOk()">
            <div class="remote-arrows-ok__ok-inner">
                OK
            </div>
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { chevronUp, chevronDown, chevronForward, chevronBack } from 'ionicons/icons';
import { publish as mqttPublish } from '@/services/mqtt-client';

export default defineComponent({
    name: 'remote-trackpad',
    setup() {
        function onTapDirection(direction: string) {
            mqttPublish('focusController', JSON.stringify({ move: direction }));
        }
        function onTapOk() {
            mqttPublish('focusController', JSON.stringify({ activate: true }));
        }

        return {
            onTapDirection, onTapOk,
            chevronUp, chevronDown, chevronForward, chevronBack
        };
    }
});
</script>

<style lang="scss">
.remote-arrows-ok {
    background: linear-gradient(to right, #252525 0%, #343434 100%);
    position: relative;
    border-radius: 100rem;
    display: block;
    color: #646464;
    width: 100%;
    height: 100%;
}
.remote-arrows-ok__up,
.remote-arrows-ok__down,
.remote-arrows-ok__left,
.remote-arrows-ok__right,
.remote-arrows-ok__ok {
    display: flex;
    position: absolute;
    background: #343434;
    color: #eaeaea;
    border: .15rem solid #1d1d1d;
    box-shadow: inset .05rem -.1rem .2rem #464646;
    align-items: center;
    justify-content: center;
    padding: 0;

    ion-icon {
        font-size: 2rem;
    }
}
.remote-arrows-ok__up,
.remote-arrows-ok__down,
.remote-arrows-ok__left,
.remote-arrows-ok__right {
    &:active {
        background: #646464;
    }
}
.remote-arrows-ok__up,
.remote-arrows-ok__down {
    width: 35%;
    height: 35%;
}
.remote-arrows-ok__left,
.remote-arrows-ok__right {
    width: 35%;
    height: 35%;
}
.remote-arrows-ok__ok {
    border: none;
    box-shadow: none;
    width: 35%;
    height: 35%;
    left: 32.5%;
    top: 32.5%;

    &:active {
        .remote-arrows-ok__ok-inner {
            background: #646464;
        }
    }
}
.remote-arrows-ok__ok-inner {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 140%;
    border-radius: 100rem;
    box-shadow: 0 0 .5rem #201f1f;
    width: 80%;
    height: 80%;
}
.remote-arrows-ok__up {
    border-radius: 1rem 1rem 0 0;
    top: 5%;
    left: 32.5%;
    ion-icon {
        margin-top: -20%;
    }
}
.remote-arrows-ok__left {
    border-radius: 1rem 0 0 1rem;
    top: 32.5%;
    left: 5%;
    ion-icon {
        margin-left: -20%;
    }
}
.remote-arrows-ok__right {
    border-radius: 0 1rem 1rem 0;
    top: 32.5%;
    right: 5%;
    ion-icon {
        margin-right: -20%;
    }
}
.remote-arrows-ok__down {
    border-radius: 0 0 1rem 1rem;
    bottom: 5%;
    left: 32.5%;
    ion-icon {
        margin-bottom: -20%;
    }
}
</style>