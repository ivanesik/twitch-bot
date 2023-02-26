import WebSocket, {ErrorEvent, CloseEvent, MessageEvent} from 'ws';

import {MINUTE} from '../constants/timers.mjs';
import {PUB_SUB_EVENTS} from '../constants/pubSubEvents.mjs';

import {IRewardData, TTwitchMessageData} from '../types/TTwitchMessageData.mjs';

import {FileWriter} from '../file/FileWriter.mjs';
import {builtTwitchAccessUrl} from '../utilities/builtTwitchAccessUrl.mjs';

import {Logger} from '../logger/logger.mjs';
import {logAction} from '../logger/logMethod.mjs';
import {logHandler} from '../logger/logHandler.mjs';

const TWITCH_PUBSUB_URL = 'wss://pubsub-edge.twitch.tv';
const PING_MESSAGE = JSON.stringify({
    type: 'PING',
});

export class TwitchSocketClient {
    private websocket: WebSocket;
    private heartbeatHandle?: NodeJS.Timer;

    constructor(private userId: string, private accessToken: string, private clientId: string) {
        this.websocket = this.start();
    }

    @logAction('Start websocket')
    private start(): WebSocket {
        const websocket = new WebSocket(TWITCH_PUBSUB_URL);
        websocket.onopen = this.onOpen.bind(this);
        websocket.onclose = this.onClose.bind(this);
        websocket.onerror = this.onError.bind(this);
        websocket.onmessage = this.onMessage.bind(this);

        return websocket;
    }

    @logAction('Stop websocket')
    public stop(): void {
        this.websocket.close();
    }

    @logAction('Subscribe', {onlyStart: true, withArgs: true})
    public subscribe(subscriptionName: string): void {
        const subscriptionData = JSON.stringify({
            type: 'LISTEN',
            data: {
                topics: [subscriptionName],
                auth_token: this.accessToken,
            },
        });

        this.websocket.send(subscriptionData);
    }

    @logAction('Send "PING"')
    private sendPing(): void {
        Logger.info('Send PING message');
        this.websocket.send(PING_MESSAGE);
    }

    @logHandler('Socket open')
    private onOpen(): void {
        this.sendPing();
        this.heartbeatHandle = setInterval(() => {
            this.sendPing();
        }, 4 * MINUTE);

        this.subscribe(PUB_SUB_EVENTS.channelPoints(this.userId));
    }

    @logHandler('Socket error')
    private onError(error: ErrorEvent): void {
        Logger.error('Socket Error', error);
        clearInterval(this.heartbeatHandle);
    }

    @logHandler('Socket disconnect')
    private onClose(event: CloseEvent): void {
        Logger.error('Socket closed by reason: ' + event.reason);
        console.log(event);
        clearInterval(this.heartbeatHandle);
    }

    @logHandler('Socket receive message')
    private onMessage(event: MessageEvent): void {
        const data =
            typeof event.data === 'string'
                ? (JSON.parse(event.data) as TTwitchMessageData)
                : undefined;

        if (!data) {
            Logger.error('No data in message');
            return;
        }

        Logger.info(`Handle: Received message type - "${data.type}"`);

        if (data.error) {
            switch (data.error) {
                case 'ERR_BADAUTH': {
                    const errorMessage =
                        `The user (${this.userId}) has not granted access.\n` +
                        `Please ask user to give token to you from: ${builtTwitchAccessUrl(
                            this.clientId,
                        )}`;
                    Logger.error(errorMessage);
                    break;
                }
                default: {
                    Logger.error(`Unknown error: ${data.error}`);
                }
            }

            return;
        }

        if (data.type === 'RECONNECT') {
            this.stop();
            this.start();
        }

        const rewardData: IRewardData = data.data?.message && JSON.parse(data.data.message);

        if (rewardData) {
            switch (rewardData.type) {
                case 'reward-redeemed': {
                    const fileWriter = new FileWriter();

                    Logger.info(
                        `Handle: receive reward "${rewardData.data.redemption.reward.title}" from ${rewardData.data.redemption.user.display_name}`,
                    );

                    fileWriter.write(
                        'rewardUsers',
                        `${rewardData.data.redemption.reward.id}.txt`,
                        rewardData.data.redemption.user.login,
                    );
                }
            }
        }
    }
}
