import { createStore } from 'vuex';
import { Storage } from '@capacitor/storage';
import { BrowserTab, StoreRootState, MqttCredentials, PrimaryVideoInfo } from '@/types';

const initialState: StoreRootState = {
    browserTabs: [],
    mqttCredentials: null,
    primaryVideoInfo: {},
    scrollSensitivity: 2
};

const store = createStore<StoreRootState>({
    state: JSON.parse(JSON.stringify(initialState)),
    mutations: {
        reset(state: StoreRootState) {
            const clonedState = JSON.parse(JSON.stringify(initialState));
            for (let prop in state) {
                (state as any)[prop] = clonedState[prop];
            }
            Storage.clear();
        },
        setBrowserTabs(state: StoreRootState, browserTabs: BrowserTab[]) {
            state.browserTabs = browserTabs;
        },
        setMqttCredentials(state: StoreRootState, mqttCredentials: MqttCredentials | null) {
            state.mqttCredentials = mqttCredentials;
            Storage.set({ key: 'mqttCredentials', value: JSON.stringify(mqttCredentials) });
        },
        setPrimaryVideoInfo(state: StoreRootState, primaryVideoInfo: PrimaryVideoInfo) {
            state.primaryVideoInfo = primaryVideoInfo;
        },
        setScrollSensitivity(state: StoreRootState, scrollSensitivity: number) {
            state.scrollSensitivity = scrollSensitivity;
            Storage.set({ key: 'scrollSensitivity', value: scrollSensitivity + '' });
        }
    },
    actions: {
        async initFromStorage({ commit }) {
            const mqttCredentials = (await Storage.get({ key: 'mqttCredentials' })).value;
            if (mqttCredentials) {
                commit('setMqttCredentials', JSON.parse(mqttCredentials));
            }
            const scrollSensitivity = (await Storage.get({ key: 'scrollSensitivity' })).value;
            if (scrollSensitivity) {
                commit('setScrollSensitivity', parseFloat(scrollSensitivity));
            }
        },
        setBrowserTabs({ commit }, browserTabs: BrowserTab[]) {
            commit('setBrowserTabs', browserTabs);
        },
        setMqttCredentials({ commit }, mqttCredentials: MqttCredentials | null) {
            commit('setMqttCredentials', mqttCredentials);
        },
        setPrimaryVideoInfo({ commit }, primaryVideoInfo: PrimaryVideoInfo) {
            commit('setPrimaryVideoInfo', primaryVideoInfo);
        },
        setScrollSensitivity({ commit }, scrollSensitivity: number) {
            commit('setScrollSensitivity', scrollSensitivity);
        }
    }
});

(window as any).store = store;

export default store;
