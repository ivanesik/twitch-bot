import {FileHelper} from '../file/FileHelper.mjs';
import {Logger} from '../logger/logger.mjs';

import type {IRewardRatingsInfo} from '../types/rewardsStorage/IRewardRatingsInfo.mjs';

import {updateRewardRating} from './updateRewardRating.mjs';
import {buildErrorFromUnknown} from './buildErrorFromUnknown.mjs';
import type {ITwitchRewardRedemption} from '../types/twitch/TTwitchMessageData.mjs';

export function writeRewardRatingJSON(
    directory: string,
    fileName: string,
    rewardRedemption: ITwitchRewardRedemption,
): void {
    const {user, reward} = rewardRedemption;

    try {
        const {user} = rewardRedemption;
        const rewardRatings: IRewardRatingsInfo =
            FileHelper.readJsonFile(directory, fileName) || {};

        rewardRatings[user.id] = updateRewardRating(user, rewardRatings, true);

        FileHelper.write(directory, fileName, JSON.stringify(rewardRatings, null, 2));
    } catch (err) {
        Logger.error(
            `Handle: Error while write reward rating ${reward.title} for ${user.display_name}`,
            buildErrorFromUnknown(err),
        );
    }
}
