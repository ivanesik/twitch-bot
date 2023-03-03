import type {TwitchHttpClient} from '../api/TwitchHttpClient.mjs';
import type {ITwitchRewardRedemption} from '../types/twitch/TTwitchMessageData.mjs';

import {Logger} from '../logger/logger.mjs';
import {FileHelper} from '../file/FileHelper.mjs';

import type {IRewardRatingsInfo} from '../types/rewardsStorage/IRewardRatingsInfo.mjs';
import type {IOpositeRewardInfo} from '../types/rewardsStorage/IRewardRatingConfig.mjs';

import {prepareUserName} from './prepareUserName.mjs';
import {updateRewardRating} from './updateRewardRating.mjs';
import {buildErrorFromUnknown} from './buildErrorFromUnknown.mjs';

export async function writeOpositeRewardRatingJSON(
    directory: string,
    opositeRewards: IOpositeRewardInfo[],
    twitchClient: TwitchHttpClient,
    rewardRedemption: ITwitchRewardRedemption,
) {
    const {reward} = rewardRedemption;

    try {
        const userNameFromInput = prepareUserName(rewardRedemption.user_input);
        const opositeReward = opositeRewards.find(
            ({targetRewardId}) => targetRewardId === reward.id,
        );

        if (opositeReward && userNameFromInput) {
            const opositeRewardFileName = `${opositeReward.opositeRewardId}.json`;
            const user = await twitchClient.getUserByLogin(userNameFromInput);

            if (user) {
                const rewardRatings: IRewardRatingsInfo =
                    FileHelper.readJsonFile(directory, opositeRewardFileName) || {};

                rewardRatings[user.id] = updateRewardRating(user, rewardRatings, false);

                FileHelper.write(
                    directory,
                    opositeRewardFileName,
                    JSON.stringify(rewardRatings, null, 2),
                );
            } else {
                Logger.error(`Can't find user with name: ${userNameFromInput}, `);
            }
        }
    } catch (err) {
        Logger.error(
            `Handle: Error while write oposite reward rating ${reward.title} from ${rewardRedemption.user.display_name} to decrease ${rewardRedemption.user_input}`,
            buildErrorFromUnknown(err),
        );
    }
}
