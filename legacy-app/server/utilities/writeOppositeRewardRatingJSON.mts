import type {ITwitchNotificationPayloadEvent} from 'types/twitch/TTwitchMessageData.mjs';
import type {IRewardRatingsInfo} from 'types/rewardsStorage/IRewardRatingsInfo.mjs';

import type {TOppositeRewardInfo} from '../config/index.mjs';
import type {TwitchHttpClient} from '../api/TwitchHttpClient.mjs';
import {Logger} from '../logger/logger.mjs';
import {FileHelper} from '../file/FileHelper.mjs';

import {prepareUserName} from './prepareUserName.mjs';
import {updateRewardRating} from './updateRewardRating.mjs';
import {buildErrorFromUnknown} from './buildErrorFromUnknown.mjs';

export async function writeOppositeRewardRatingJSON(
    directory: string,
    fileName: string,
    oppositeReward: TOppositeRewardInfo,
    twitchClient: TwitchHttpClient,
    rewardRedemption: ITwitchNotificationPayloadEvent,
): Promise<void> {
    const {reward} = rewardRedemption;

    try {
        const userNameFromInput = prepareUserName(rewardRedemption.user_input);

        if (oppositeReward && userNameFromInput) {
            const user = await twitchClient.getUserByLogin(userNameFromInput);
            const fakeUser = {
                id: `unknown-${userNameFromInput}`,
                display_name: userNameFromInput,
            };
            const rewardRatings: IRewardRatingsInfo =
                FileHelper.readJsonFile(directory, fileName) || {};

            if (user) {
                rewardRatings[user.id] = updateRewardRating(
                    user.id,
                    user.display_name,
                    rewardRatings,
                    false,
                );
            } else {
                Logger.error(
                    `Can't find user with name: ${userNameFromInput}. Write unknown user with id ${fakeUser.id}`,
                );
                rewardRatings[fakeUser.id] = updateRewardRating(
                    fakeUser.id,
                    fakeUser.display_name,
                    rewardRatings,
                    false,
                );
            }

            FileHelper.write(directory, fileName, JSON.stringify(rewardRatings, null, 2));
        }
    } catch (err) {
        Logger.error(
            `Handle: Error while write opposite reward rating ${reward.title} from ${rewardRedemption.user_name} to decrease ${rewardRedemption.user_input}`,

            buildErrorFromUnknown(err),
        );
    }
}
