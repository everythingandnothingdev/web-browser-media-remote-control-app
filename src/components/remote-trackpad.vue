<template>
    <div
        class="remote-trackpad"
        @pointerdown="onPointerDownTrackpad"
        @touchstart="onTouchStartTrackpad">
        <div class="remote-trackpad__icons">
            <ion-icon :icon="chevronUp"/><br>
            Scroll<br>
            <ion-icon :icon="chevronDown" style="margin-top: .2rem" />
        </div>
        <div class="remote-trackpad__touches">
            <div class="remote-trackpad__touch"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { chevronUp, chevronDown } from 'ionicons/icons';
import { publish as mqttPublish } from '@/services/mqtt-client';
import { throttle } from '@/lib/timing';
import store from '@/store';

export default defineComponent({
    name: 'remote-trackpad',
    setup() {
        let pointerStartId: number | null = null;
        let pointerStart: DOMPoint | null = null;
        let lastPreviewDeltaX: number = 0;
        let lastPreviewDeltaY: number = 0;

        onMounted(() => {
            window.addEventListener('pointerup', onPointerUpDocument, true);
            window.addEventListener('pointermove', onPointerMoveDocument, true);
            window.addEventListener('touchmove', onTouchMoveDocument, true);
            window.addEventListener('touchend', onTouchEndDocument, true);
        });

        onUnmounted(() => {
            window.removeEventListener('pointerup', onPointerUpDocument);
            window.removeEventListener('pointermove', onPointerMoveDocument);
            window.removeEventListener('touchmove', onTouchMoveDocument);
            window.removeEventListener('touchend', onTouchEndDocument);
        });

        const previewScrollDelta = throttle((deltaX: number, deltaY: number) => {
            if (pointerStart) {
                lastPreviewDeltaX = deltaX;
                lastPreviewDeltaY = deltaY;
                mqttPublish('scrollController', JSON.stringify({ state: 'preview', dx: deltaX, dy: deltaY, t: window.performance.now() }));
            }
        }, 25);

        function commitScrollDelta(deltaX: number, deltaY: number) {
            mqttPublish('scrollController', JSON.stringify({ state: 'committed', dx: deltaX, dy: deltaY, t: window.performance.now() }));
        }

        function onPointerDownTrackpad(event: PointerEvent) {
            if (['mouse', 'pen'].includes(event.pointerType)) {
                pointerStartId = event.pointerId;
                pointerStart = new DOMPoint(event.pageX, event.pageY);
            }
        }
        function onTouchStartTrackpad(event: TouchEvent) {
            pointerStartId = event.touches[0].identifier;
            pointerStart = new DOMPoint(event.touches[0].pageX, event.touches[0].pageY);
        }

        function onPointerMoveDocument(event: PointerEvent) {
            if (['mouse', 'pen'].includes(event.pointerType)) {
                if (pointerStartId != null && event.pointerId === pointerStartId && pointerStart) {
                    const deltaX = event.pageX - pointerStart.x;
                    const deltaY = -(event.pageY - pointerStart.y);
                    previewScrollDelta(deltaX * store.state.scrollSensitivity, deltaY * store.state.scrollSensitivity);
                }
            }
        }
        function onTouchMoveDocument(event: TouchEvent) {
            if (pointerStartId != null && event.touches[0]?.identifier === pointerStartId && pointerStart) {
                const deltaX = event.touches[0].pageX - pointerStart.x;
                const deltaY = -(event.touches[0].pageY - pointerStart.y);
                previewScrollDelta(deltaX * store.state.scrollSensitivity, deltaY * store.state.scrollSensitivity);
            }
        }

        function onPointerUpDocument(event: PointerEvent) {
            if (['mouse', 'pen'].includes(event.pointerType)) {
                if (event.pointerId === pointerStartId) {
                    if (pointerStart) {
                        const deltaX = event.pageX - pointerStart.x;
                        const deltaY = -(event.pageY - pointerStart.y);
                        commitScrollDelta(deltaX * store.state.scrollSensitivity, deltaY * store.state.scrollSensitivity);
                    } else {
                        commitScrollDelta(0, 0);
                    }
                    pointerStartId = null;
                    pointerStart = null;
                }
            }
        }
        function onTouchEndDocument(event: TouchEvent) {
            if (Array.from(event.touches).filter(touch => touch.identifier === pointerStartId).length === 0) {
                if (pointerStart) {
                    commitScrollDelta(lastPreviewDeltaX, lastPreviewDeltaY);
                    pointerStartId = null;
                    pointerStart = null;
                }
            }
        }

        return {
            chevronUp, chevronDown,
            onPointerDownTrackpad, onTouchStartTrackpad
        };
    }
});
</script>

<style lang="scss">
.remote-trackpad {
    background: linear-gradient(to right, #403f3f 0%, #2d2d2d 100%);
    box-shadow: inset 0 0 3px #404040;
    position: relative;
    display: block;
    color: #646464;
    border-top: 0.15rem solid #1a1a1a;
    border-left: 0.15rem solid #1a1a1a;
    border-right: 0.15rem solid #1a1a1a;
    border-bottom: 0.15rem solid #1a1a1a;
    border-radius: 1rem;
    user-select: none;
    width: 100%;
    height: 100%;
}
.remote-trackpad * {
    pointer-events: none;
}
.remote-trackpad__icons {
    display: inline-block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}
</style>