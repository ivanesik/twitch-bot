import type {ITwitchNotificationPayloadEvent} from '../types/twitch/TTwitchMessageData.mjs';
import type {IRewardRatingsInfo} from '../types/rewardsStorage/IRewardRatingsInfo.mjs';

import {Logger} from '../logger/logger.mjs';
import {FileHelper} from '../file/FileHelper.mjs';

import {updateRewardRating} from './updateRewardRating.mjs';
import {buildErrorFromUnknown} from './buildErrorFromUnknown.mjs';

export function writeRewardRatingJSON(
    directory: string,
    fileName: string,
    rewardRedemption: ITwitchNotificationPayloadEvent,
): void {
    const {user_name, reward} = rewardRedemption;

    try {
        const {user_id} = rewardRedemption;
        const rewardRatings: IRewardRatingsInfo =
            FileHelper.readJsonFile(directory, fileName) || {};

        rewardRatings[user_id] = updateRewardRating(
            rewardRedemption.user_id,
            rewardRedemption.user_name,
            rewardRatings,
            true,
        );

        FileHelper.write(directory, fileName, JSON.stringify(rewardRatings, null, 2));
    } catch (err) {
        Logger.error(
            `Handle: Error while write reward rating ${reward.title} for ${user_name}`,
            buildErrorFromUnknown(err),
        );
    }
}
