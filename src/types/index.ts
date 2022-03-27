export interface BrowserTab {
    id: number,
    active: boolean,
    title: string,
    url: string
}

export interface MqttCredentials {
    protocol: string,
    host: string,
    port: string,
    username: string,
    password: string,
    topicPrefix: string
}

export interface PrimaryVideoInfo {
    exists?: boolean,
    paused?: boolean
}

export interface StoreRootState {
    browserTabs: BrowserTab[],
    mqttCredentials: MqttCredentials | null,
    primaryVideoInfo: PrimaryVideoInfo,
    scrollSensitivity: number
}
