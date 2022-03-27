import { ref } from 'vue';
import mqtt, { IClientSubscribeOptions } from 'mqtt';
import mitt from 'mitt';
import { defaultMqttTopicPrefix } from '@/constants';
import store from '@/store';
import { resolveProjectReferencePath } from 'typescript';

interface ConnectArgs {
    protocol: string,
    host: string,
    port: string,
    username?: string,
    password?: string,
    topicPrefix?: string
}
type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'offline' | 'disconnected' | 'error';

let client: mqtt.MqttClient;
const eventBus = mitt();
let connectionStatus = ref<ConnectionStatus>('disconnected');
let connectionStatusMessage = ref<string>();
let topicPrefix: string = defaultMqttTopicPrefix;

function notifyConnectionStatus(status: ConnectionStatus, message?: string) {
    connectionStatus.value = status;
    connectionStatusMessage.value = message;
    eventBus.emit('connectionStatusChange', {
        status, message
    });
}

function onConnect() {
    notifyConnectionStatus('connected');
    topicPrefix = store.state.mqttCredentials?.topicPrefix || defaultMqttTopicPrefix;
    client.subscribe(topicPrefix + '/#', (err) => {
        if (err) {
            client.end();
        }
    });
}

function onReconnect() {
    notifyConnectionStatus('reconnecting');
}

function onOffline() {
    notifyConnectionStatus('offline');
}

function onError(err: any) {
    notifyConnectionStatus('error', err.toString());
    client.end();
}

function onClose() {
    notifyConnectionStatus('disconnected');
}

function onMessage(topic: string, message: string) {
    eventBus.emit('message', {
        topic: topic.replace(topicPrefix + '/', ''),
        message
    });
}

async function connect({ protocol, host, port, username, password, topicPrefix }: ConnectArgs) {
    store.dispatch('setMqttCredentials', {
        protocol,
        host,
        port,
        username,
        password,
        topicPrefix: topicPrefix || defaultMqttTopicPrefix
    });
    end();
    client = mqtt.connect(protocol + host, {
        port: parseInt(port, 10),
        username,
        password
    });
    notifyConnectionStatus('connecting');
    client.on('connect', onConnect);
    client.on('reconnect', onReconnect);
    client.on('offline', onOffline);
    client.on('error', onError);
    client.on('close', onClose);
    client.on('message', onMessage);
}

async function waitForConnected() {
    if (connectionStatus.value === 'connected') {
        return;
    }
    return new Promise<void>((resolve, reject) => {
        let interval = setInterval(() => {
            if (connectionStatus.value === 'connected') {
                clearInterval(interval);
                resolve();
            }
            else if (connectionStatus.value === 'error') {
                clearInterval(interval);
                reject(connectionStatusMessage.value);
            }
        }, 100);
    });
}

async function publish(topic: string, message: string): Promise<mqtt.Packet | undefined> {
    if (!client) {
        if (store.state.mqttCredentials && connectionStatus.value === 'disconnected') {
            await connect(store.state.mqttCredentials);
        } else {
            throw 'No client.';
        }
    }
    await waitForConnected();
    return new Promise((resolve, reject) => {
        client.publish(topicPrefix + '/' + topic, message, (error, packet) => {
            if (error) {
                reject(error);
            } else {
                resolve(packet);
            }
        });
    });
}

async function subscribe(topic: string, opts: IClientSubscribeOptions): Promise<void> {
    if (!client) {
        if (store.state.mqttCredentials && connectionStatus.value === 'disconnected') {
            await connect(store.state.mqttCredentials);
        } else {
            throw 'No client.';
        }
    }
    await waitForConnected();
    return new Promise((resolve, reject) => {
        client.subscribe(topicPrefix + '/' + topic, opts, (error, granted) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

async function unsubscribe(topic: string | string[]): Promise<void> {
    if (!client) {
        if (store.state.mqttCredentials && connectionStatus.value === 'disconnected') {
            await connect(store.state.mqttCredentials);
        } else {
            throw 'No client.';
        }
    }
    await waitForConnected();
    return new Promise((resolve, reject) => {
        client.unsubscribe(topicPrefix + '/' + topic, {}, (error, granted) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

async function end() {
    const oldClient = client;
    (client as any) = undefined;
    if (oldClient) {
        oldClient.off('connect', onConnect);
        oldClient.off('reconnect', onReconnect);
        oldClient.off('offline', onOffline);
        oldClient.off('error', onError);
        oldClient.off('close', onClose);
        oldClient.off('message', onMessage);
        notifyConnectionStatus('disconnected');
        await new Promise<void>((resolve) => {
            try {
                oldClient.end(undefined, undefined, () => {
                    resolve();
                });
            } catch (error) {
                resolve();
            }
        });
    }
    
}

export {
    connectionStatus,
    connectionStatusMessage,
    connect,
    waitForConnected,
    publish,
    subscribe,
    unsubscribe,
    end,
    eventBus
};
