import WebSocket, {type ErrorEvent, type CloseEvent, type MessageEvent} from 'ws';

import {SECOND} from 'constants/timers.mjs';

import type {IRewardFilesInfo} from 'types/rewardsStorage/IRewardFilesInfo.mjs';
import {
    type TTwitchEventSubMessageData,
    isTwitchSessionWelcomeMessage,
    isTwitchSessionKeepAliveMessage,
    isTwitchNotificationMessage,
    isTwitchReconnectMessage,
} from 'types/twitch/TTwitchMessageData.mjs';

import {writeLastRewardedUser} from 'utilities/writeLastRewardedUser.mjs';
import {writeRewardRatingJSON} from 'utilities/writeRewardRatingJSON.mjs';
import {writeRewardRatingInTemplate} from 'utilities/writeRewardRatingInTemplate.mjs';
import {writeOppositeRewardRatingJSON} from 'utilities/writeOppositeRewardRatingJSON.mjs';

import {config} from '../config/index.mjs';
import {Logger} from '../logger/logger.mjs';
import {logAction} from '../logger/logMethod.mjs';
import {logHandler} from '../logger/logHandler.mjs';

import {TwitchHttpClient} from './TwitchHttpClient.mjs';
import {twitchEventSubTopics} from 'constants/eventSubEvents.mjs';

const REWARD_USERS_DIRECTORY = 'rewardUsers';
const REWARD_RATINGS_DIRECTORY = 'rewardRatings';
const TEMPLATED_RATINGS_DIRECTORY = 'templatedRewardRatings';
const TEMPLATED_ANTI_RATINGS_DIRECTORY = 'templatedAntiRewardRatings';

export class TwitchSocketClient {
    private connectUrl = 'wss://eventsub.wss.twitch.tv/ws';

    private twitchClient: TwitchHttpClient;
    private websocket?: WebSocket;

    private keepAliveTimer?: NodeJS.Timer;
    private keepAliveTimeoutSeconds: number = 10;

    constructor(
        private userId: string,
        accessToken: string,
        clientId: string,
    ) {
        this.start();
        this.twitchClient = new TwitchHttpClient(clientId, accessToken);
    }

    @logAction('Start websocket')
    private start(): void {
        this.websocket = new WebSocket(this.connectUrl);
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
        clearInterval(this.keepAliveTimer);
    }

    @logAction('Subscribe', {onlyStart: true, withArgs: true})
    private async subscribe(sessionId: string): Promise<void> {
        await this.twitchClient.subscribeToEvents({
            scope: twitchEventSubTopics.channelRewardRedemption,
            userId: this.userId,
            sessionId,
        });
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
                ? (JSON.parse(event.data) as TTwitchEventSubMessageData)
                : undefined;

        if (!data) {
            Logger.error('No data in message');
            return;
        }

        Logger.info(`Handle: Received message type - "${data.metadata.message_type}"`);

        // if (data.error) {
        //     switch (data.error) {
        //         case 'ERR_BADAUTH': {
        //             const errorMessage =
        //                 `The user (${this.userId}) has not granted access.\n` +
        //                 `Please ask user to give token to you from: ${builtTwitchAccessUrl(
        //                     this.clientId,
        //                 )}`;
        //             Logger.error(errorMessage);
        //             break;
        //         }
        //         default: {
        //             Logger.error(`Unknown error: ${data.error}`);
        //         }
        //     }

        //     return;
        // }

        if (isTwitchSessionWelcomeMessage(data)) {
            await this.subscribe(data.payload.session.id);
            this.keepAliveTimeoutSeconds = data.payload.session.keepalive_timeout_seconds;
        } else if (isTwitchSessionKeepAliveMessage(data)) {
            const timeoutMs = (this.keepAliveTimeoutSeconds + 1) * SECOND;

            clearTimeout(this.keepAliveTimer);
            this.keepAliveTimer = setTimeout(() => {
                Logger.error('Twitch socket: keep alive timeout');
                this.stop();
            }, timeoutMs);
        } else if (isTwitchReconnectMessage(data)) {
            this.connectUrl = data.payload.session.reconnect_url;

            if (data.payload.session.keepalive_timeout_seconds) {
                this.keepAliveTimeoutSeconds = data.payload.session.keepalive_timeout_seconds;
            }

            this.stop();
        } else if (
            isTwitchNotificationMessage(data) &&
            data.payload.subscription.type === 'channel.channel_points_custom_reward_redemption.add'
        ) {
            const rewardRedemption = data.payload.event;
            const reward = data.payload.event.reward;
            const oppositeReward = config.oppositeRewards?.find(
                ({targetRewardId}) => targetRewardId === reward.id,
            );

            const rewardTemplates = config.templates?.[reward.id];
            const oppositeRewardTemplates = oppositeReward
                ? config.templates?.[oppositeReward.oppositeRewardId]
                : undefined;

            const rewardFilesInfo: IRewardFilesInfo = {
                rewardRatingFileName: `${reward.id}.json`,
                templateRewardRatingFileName: `${reward.id}.txt`,
                template: rewardTemplates?.normal,
            };
            const antiRewardFilesInfo: IRewardFilesInfo = {
                rewardRatingFileName: `${reward.id}.json`,
                templateRewardRatingFileName: `${reward.id}.txt`,
                template: rewardTemplates?.reverse,
            };

            const oppositeRewardFilesInfo: IRewardFilesInfo | undefined =
                oppositeReward?.oppositeRewardId
                    ? {
                          rewardRatingFileName: `${oppositeReward?.oppositeRewardId}.json`,
                          templateRewardRatingFileName: `${oppositeReward?.oppositeRewardId}.txt`,
                          template: oppositeRewardTemplates?.normal,
                      }
                    : undefined;
            const oppositeAntiRewardFilesInfo: IRewardFilesInfo | undefined =
                oppositeReward?.oppositeRewardId
                    ? {
                          rewardRatingFileName: `${oppositeReward?.oppositeRewardId}.json`,
                          templateRewardRatingFileName: `${oppositeReward?.oppositeRewardId}.txt`,
                          template: oppositeRewardTemplates?.reverse,
                      }
                    : undefined;

            Logger.info(
                `Handle: receive reward "${reward.title}" from ${rewardRedemption.user_name}`,
            );

            writeLastRewardedUser(REWARD_USERS_DIRECTORY, rewardRedemption);
            writeRewardRatingJSON(
                REWARD_RATINGS_DIRECTORY,
                rewardFilesInfo.rewardRatingFileName,
                rewardRedemption,
            );

            if (oppositeRewardFilesInfo && oppositeReward) {
                await writeOppositeRewardRatingJSON(
                    REWARD_RATINGS_DIRECTORY,
                    oppositeRewardFilesInfo.rewardRatingFileName,
                    oppositeReward,
                    this.twitchClient,
                    rewardRedemption,
                );
            }

            writeRewardRatingInTemplate(
                REWARD_RATINGS_DIRECTORY,
                TEMPLATED_RATINGS_DIRECTORY,
                rewardRedemption,
                rewardFilesInfo,
                false,
            );

            writeRewardRatingInTemplate(
                REWARD_RATINGS_DIRECTORY,
                TEMPLATED_ANTI_RATINGS_DIRECTORY,
                rewardRedemption,
                antiRewardFilesInfo,
                true,
            );

            if (oppositeRewardFilesInfo) {
                writeRewardRatingInTemplate(
                    REWARD_RATINGS_DIRECTORY,
                    TEMPLATED_RATINGS_DIRECTORY,
                    rewardRedemption,
                    oppositeRewardFilesInfo,
                    false,
                );
            }

            if (oppositeAntiRewardFilesInfo) {
                writeRewardRatingInTemplate(
                    REWARD_RATINGS_DIRECTORY,
                    TEMPLATED_ANTI_RATINGS_DIRECTORY,
                    rewardRedemption,
                    oppositeAntiRewardFilesInfo,
                    true,
                );
            }
        } else {
            Logger.error(`Unhandled message type: ${data.metadata.message_type}`);
        }

        switch (data.metadata.message_type) {
            case 'RECONNECT': {
                this.stop();
                break;
            }
            // case 'MESSAGE': {
            //     const rewardData: undefined | IRewardData =
            //         data.data?.message && JSON.parse(data.data.message);

            //     if (!rewardData) {
            //         return;
            //     }

            //     switch (rewardData.type) {
            //         case 'reward-redeemed': {
            //             const rewardRedemption = rewardData.data.redemption;
            //             const reward = rewardRedemption.reward;

            //             const oppositeReward = config.oppositeRewards?.find(
            //                 ({targetRewardId}) => targetRewardId === reward.id,
            //             );

            //             const rewardTemplates = config.templates?.[reward.id];
            //             const oppositeRewardTemplates = oppositeReward
            //                 ? config.templates?.[oppositeReward.oppositeRewardId]
            //                 : undefined;

            //             const rewardFilesInfo: IRewardFilesInfo = {
            //                 rewardRatingFileName: `${reward.id}.json`,
            //                 templateRewardRatingFileName: `${reward.id}.txt`,
            //                 template: rewardTemplates?.normal,
            //             };
            //             const antiRewardFilesInfo: IRewardFilesInfo = {
            //                 rewardRatingFileName: `${reward.id}.json`,
            //                 templateRewardRatingFileName: `${reward.id}.txt`,
            //                 template: rewardTemplates?.reverse,
            //             };

            //             const oppositeRewardFilesInfo: IRewardFilesInfo | undefined =
            //                 oppositeReward?.oppositeRewardId
            //                     ? {
            //                           rewardRatingFileName: `${oppositeReward?.oppositeRewardId}.json`,
            //                           templateRewardRatingFileName: `${oppositeReward?.oppositeRewardId}.txt`,
            //                           template: oppositeRewardTemplates?.normal,
            //                       }
            //                     : undefined;
            //             const oppositeAntiRewardFilesInfo: IRewardFilesInfo | undefined =
            //                 oppositeReward?.oppositeRewardId
            //                     ? {
            //                           rewardRatingFileName: `${oppositeReward?.oppositeRewardId}.json`,
            //                           templateRewardRatingFileName: `${oppositeReward?.oppositeRewardId}.txt`,
            //                           template: oppositeRewardTemplates?.reverse,
            //                       }
            //                     : undefined;

            //             Logger.info(
            //                 `Handle: receive reward "${reward.title}" from ${rewardRedemption.user.display_name}`,
            //             );

            //             writeLastRewardedUser(REWARD_USERS_DIRECTORY, rewardRedemption);
            //             writeRewardRatingJSON(
            //                 REWARD_RATINGS_DIRECTORY,
            //                 rewardFilesInfo.rewardRatingFileName,
            //                 rewardRedemption,
            //             );

            //             if (oppositeRewardFilesInfo && oppositeReward) {
            //                 await writeOppositeRewardRatingJSON(
            //                     REWARD_RATINGS_DIRECTORY,
            //                     oppositeRewardFilesInfo.rewardRatingFileName,
            //                     oppositeReward,
            //                     this.twitchClient,
            //                     rewardRedemption,
            //                 );
            //             }

            //             writeRewardRatingInTemplate(
            //                 REWARD_RATINGS_DIRECTORY,
            //                 TEMPLATED_RATINGS_DIRECTORY,
            //                 rewardRedemption,
            //                 rewardFilesInfo,
            //                 false,
            //             );

            //             writeRewardRatingInTemplate(
            //                 REWARD_RATINGS_DIRECTORY,
            //                 TEMPLATED_ANTI_RATINGS_DIRECTORY,
            //                 rewardRedemption,
            //                 antiRewardFilesInfo,
            //                 true,
            //             );

            //             if (oppositeRewardFilesInfo) {
            //                 writeRewardRatingInTemplate(
            //                     REWARD_RATINGS_DIRECTORY,
            //                     TEMPLATED_RATINGS_DIRECTORY,
            //                     rewardRedemption,
            //                     oppositeRewardFilesInfo,
            //                     false,
            //                 );
            //             }

            //             if (oppositeAntiRewardFilesInfo) {
            //                 writeRewardRatingInTemplate(
            //                     REWARD_RATINGS_DIRECTORY,
            //                     TEMPLATED_ANTI_RATINGS_DIRECTORY,
            //                     rewardRedemption,
            //                     oppositeAntiRewardFilesInfo,
            //                     true,
            //                 );
            //             }
            //         }
            //     }
            // }
        }
    }
}
