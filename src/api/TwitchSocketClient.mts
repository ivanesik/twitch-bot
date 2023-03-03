import WebSocket, {ErrorEvent, CloseEvent, MessageEvent} from 'ws';

import {MINUTE, SECOND} from '../constants/timers.mjs';
import {PUB_SUB_EVENTS} from '../constants/pubSubEvents.mjs';

import type {IRewardRatingConfig} from '../types/rewardsStorage/IRewardRatingConfig.mjs';
import type {IRewardData, TTwitchMessageData} from '../types/twitch/TTwitchMessageData.mjs';

import {FileHelper} from '../file/FileHelper.mjs';
import {TwitchHttpClient} from './TwitchHttpClient.mjs';

import {Logger} from '../logger/logger.mjs';
import {logAction} from '../logger/logMethod.mjs';
import {logHandler} from '../logger/logHandler.mjs';
import {builtTwitchAccessUrl} from '../utilities/builtTwitchAccessUrl.mjs';
import {writeLastRewardedUser} from '../utilities/writeLastRewardedUser.mjs';
import {writeRewardRatingJSON} from '../utilities/writeRewardRatingJSON.mjs';
import {writeRewardRatingInTemplate} from '../utilities/writeRewardRatingInTemplate.mjs';

import {writeOpositeRewardRatingJSON} from '../utilities/writeOpositeRewardRatingJSON.mjs';

const TWITCH_PUBSUB_URL = 'wss://pubsub-edge.twitch.tv';
const PING_MESSAGE = JSON.stringify({
    type: 'PING',
});

const REWARD_USERS_DIRECTORY = 'rewardUsers';
const REWARD_RATINGS_DIRECTORY = 'rewardRatings';

const REWARD_RATINGS_CONFIG: IRewardRatingConfig | undefined = FileHelper.readJsonFile(
    REWARD_RATINGS_DIRECTORY,
    'config.json',
);

export class TwitchSocketClient {
    private twitchClient: TwitchHttpClient;
    private websocket: WebSocket;
    private heartbeatTimer?: NodeJS.Timer;
    private pingTimeountTimer?: NodeJS.Timer;

    constructor(private userId: string, private accessToken: string, private clientId: string) {
        this.websocket = this.start();
        this.twitchClient = new TwitchHttpClient(clientId, accessToken);
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

    @logAction('Reconnect')
    private reconnect(): void {
        this.stop();
        this.start();
    }

    @logAction('Stop websocket')
    public stop(): void {
        clearInterval(this.heartbeatTimer);
        clearTimeout(this.pingTimeountTimer);
        this.websocket.terminate();
    }

    @logAction('Subscribe', {onlyStart: true, withArgs: true})
    private subscribe(subscriptionName: string): void {
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

        this.pingTimeountTimer = setTimeout(() => {
            this.reconnect();
        }, 10 * SECOND);
    }

    @logHandler('Socket open')
    private onOpen(): void {
        this.sendPing();
        this.heartbeatTimer = setInterval(() => {
            this.sendPing();
        }, 1 * MINUTE);

        this.subscribe(PUB_SUB_EVENTS.channelPoints(this.userId));
    }

    @logHandler('Socket error')
    private onError(error: ErrorEvent): void {
        Logger.error('Socket errored with data:', error);
        this.reconnect();
    }

    @logHandler('Socket disconnect')
    private onClose(event: CloseEvent): void {
        Logger.error(
            `Socket closed with code ${event.code} by reason: ${event.reason || 'UNKNOWN'}`,
        );
        clearInterval(this.heartbeatTimer);
    }

    @logHandler('Socket receive message')
    private async onMessage(event: MessageEvent): Promise<void> {
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

        switch (data.type) {
            case 'RECONNECT': {
                this.reconnect();
                break;
            }
            case 'PONG': {
                clearTimeout(this.pingTimeountTimer);
                break;
            }
            case 'MESSAGE': {
                const rewardData: undefined | IRewardData =
                    data.data?.message && JSON.parse(data.data.message);

                if (!rewardData) {
                    return;
                }

                switch (rewardData.type) {
                    case 'reward-redeemed': {
                        const rewardRedemption = rewardData.data.redemption;
                        const reward = rewardRedemption.reward;
                        const rewardRatingFileName = `${reward.id}.json`;
                        const template = REWARD_RATINGS_CONFIG?.templates?.[reward.id];
                        const opositeRewards = REWARD_RATINGS_CONFIG?.opositeRewards;

                        Logger.info(
                            `Handle: receive reward "${reward.title}" from ${rewardRedemption.user.display_name}`,
                        );

                        writeLastRewardedUser(REWARD_USERS_DIRECTORY, rewardRedemption);
                        writeRewardRatingJSON(
                            REWARD_RATINGS_DIRECTORY,
                            rewardRatingFileName,
                            rewardRedemption,
                        );

                        if (opositeRewards) {
                            writeOpositeRewardRatingJSON(
                                REWARD_RATINGS_DIRECTORY,
                                opositeRewards,
                                this.twitchClient,
                                rewardRedemption,
                            );
                        }

                        if (template) {
                            writeRewardRatingInTemplate(
                                REWARD_RATINGS_DIRECTORY,
                                rewardRatingFileName,
                                template,
                                rewardRedemption,
                            );
                        }
                    }
                }
            }
        }
    }
}
