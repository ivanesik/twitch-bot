import WebSocket from 'ws';
import type {ErrorEvent, CloseEvent, MessageEvent} from 'ws';

import {config, type TRewardTemplate} from '../config/index.mjs';

import {MINUTE, SECOND} from '../constants/timers.mjs';
import {PUB_SUB_EVENTS} from '../constants/pubSubEvents.mjs';

import type {IRewardData, TTwitchMessageData} from '../types/twitch/TTwitchMessageData.mjs';

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
const TEMPLATED_RATINGS_DIRECTORY = 'templatedRewardRatings';
const TEMPLATED_ANTI_RATINGS_DIRECTORY = 'templatedAntiRewardRatings';

interface IRewardFilesInfo {
    template?: TRewardTemplate;
    rewardRatingFileName: string;
    templateRewardRatingFileName: string;
}

export class TwitchSocketClient {
    private twitchClient: TwitchHttpClient;
    private websocket?: WebSocket;
    private heartbeatTimer?: NodeJS.Timer;
    private pingTimeountTimer?: NodeJS.Timer;

    constructor(
        private userId: string,
        private accessToken: string,
        private clientId: string,
    ) {
        this.start();
        this.twitchClient = new TwitchHttpClient(clientId, accessToken);
    }

    @logAction('Start websocket')
    private start(): void {
        this.websocket = new WebSocket(TWITCH_PUBSUB_URL);
        this.websocket.onopen = this.onOpen.bind(this);
        this.websocket.onclose = this.onClose.bind(this);
        this.websocket.onerror = this.onError.bind(this);
        this.websocket.onmessage = this.onMessage.bind(this);
    }

    @logAction('Stop websocket')
    public stop(): void {
        this.cleanup();
        this.websocket?.close();
    }

    @logAction('Cleanup')
    private cleanup(): void {
        clearInterval(this.heartbeatTimer);
        clearTimeout(this.pingTimeountTimer);
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

        this.websocket?.send(subscriptionData);
    }

    @logAction('Send "PING"')
    private sendPing(): void {
        this.websocket?.send(PING_MESSAGE);

        this.pingTimeountTimer = setTimeout(() => {
            this.stop();
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
        this.stop();
    }

    @logHandler('Socket disconnect')
    private onClose(event: CloseEvent): void {
        Logger.error(
            `Socket closed with code ${event.code} by reason: ${event.reason || 'UNKNOWN'}`,
        );
        this.cleanup();
        this.start();
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
                this.stop();
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
                        const rewardFilesInfo: IRewardFilesInfo = {
                            rewardRatingFileName: `${reward.id}.json`,
                            templateRewardRatingFileName: `${reward.id}.txt`,
                            template: config.templates?.[reward.id].normal,
                        };
                        const antiRewardFilesInfo: IRewardFilesInfo = {
                            rewardRatingFileName: `${reward.id}.json`,
                            templateRewardRatingFileName: `${reward.id}.txt`,
                            template: config.templates?.[reward.id].reverse,
                        };

                        const opositeReward = config.opositeRewards?.find(
                            ({targetRewardId}) => targetRewardId === reward.id,
                        );
                        const opositeRewardFilesInfo: IRewardFilesInfo | undefined =
                            opositeReward?.opositeRewardId
                                ? {
                                      rewardRatingFileName: `${opositeReward?.opositeRewardId}.json`,
                                      templateRewardRatingFileName: `${opositeReward?.opositeRewardId}.txt`,
                                      template:
                                          config.templates?.[opositeReward.opositeRewardId].normal,
                                  }
                                : undefined;
                        const opositeAntiRewardFilesInfo: IRewardFilesInfo | undefined =
                            opositeReward?.opositeRewardId
                                ? {
                                      rewardRatingFileName: `${opositeReward?.opositeRewardId}.json`,
                                      templateRewardRatingFileName: `${opositeReward?.opositeRewardId}.txt`,
                                      template:
                                          config.templates?.[opositeReward.opositeRewardId].reverse,
                                  }
                                : undefined;

                        Logger.info(
                            `Handle: receive reward "${reward.title}" from ${rewardRedemption.user.display_name}`,
                        );

                        writeLastRewardedUser(REWARD_USERS_DIRECTORY, rewardRedemption);
                        writeRewardRatingJSON(
                            REWARD_RATINGS_DIRECTORY,
                            rewardFilesInfo.rewardRatingFileName,
                            rewardRedemption,
                        );

                        if (opositeRewardFilesInfo && opositeReward) {
                            await writeOpositeRewardRatingJSON(
                                REWARD_RATINGS_DIRECTORY,
                                opositeRewardFilesInfo.rewardRatingFileName,
                                opositeReward,
                                this.twitchClient,
                                rewardRedemption,
                            );
                        }

                        if (rewardFilesInfo.template) {
                            writeRewardRatingInTemplate(
                                REWARD_RATINGS_DIRECTORY,
                                rewardFilesInfo.rewardRatingFileName,
                                TEMPLATED_RATINGS_DIRECTORY,
                                rewardFilesInfo.templateRewardRatingFileName,
                                rewardFilesInfo.template,
                                rewardRedemption,
                                false,
                            );
                        }

                        if (antiRewardFilesInfo.template) {
                            writeRewardRatingInTemplate(
                                REWARD_RATINGS_DIRECTORY,
                                antiRewardFilesInfo.rewardRatingFileName,
                                TEMPLATED_ANTI_RATINGS_DIRECTORY,
                                antiRewardFilesInfo.templateRewardRatingFileName,
                                antiRewardFilesInfo.template,
                                rewardRedemption,
                                true,
                            );
                        }

                        if (opositeRewardFilesInfo?.template) {
                            writeRewardRatingInTemplate(
                                REWARD_RATINGS_DIRECTORY,
                                opositeRewardFilesInfo.rewardRatingFileName,
                                TEMPLATED_RATINGS_DIRECTORY,
                                opositeRewardFilesInfo.templateRewardRatingFileName,
                                opositeRewardFilesInfo.template,
                                rewardRedemption,
                                false,
                            );
                        }

                        if (opositeAntiRewardFilesInfo?.template) {
                            writeRewardRatingInTemplate(
                                REWARD_RATINGS_DIRECTORY,
                                opositeAntiRewardFilesInfo.rewardRatingFileName,
                                TEMPLATED_RATINGS_DIRECTORY,
                                opositeAntiRewardFilesInfo.templateRewardRatingFileName,
                                opositeAntiRewardFilesInfo.template,
                                rewardRedemption,
                                true,
                            );
                        }
                    }
                }
            }
        }
    }
}
