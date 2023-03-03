import _ from 'lodash-es';

import {Logger} from '../logger/logger.mjs';
import {FileHelper} from '../file/FileHelper.mjs';

import type {IRewardRatingsInfo} from '../types/rewardsStorage/IRewardRatingsInfo.mjs';

import {buildErrorFromUnknown} from './buildErrorFromUnknown.mjs';
import type {ITwitchRewardRedemption} from '../types/twitch/TTwitchMessageData.mjs';

export function writeRewardRatingInTemplate(
    directory: string,
    ratingJsonFileName: string,
    template: string,
    rewardRedemption: ITwitchRewardRedemption,
): void {
    const rewardUser = rewardRedemption.user;
    const reward = rewardRedemption.reward;
    const rewardId = reward.id;

    try {
        const rewardRatings: IRewardRatingsInfo =
            FileHelper.readJsonFile(directory, ratingJsonFileName) || {};

        const templator = _.template(template);
        const preparedUsers = Object.values(rewardRatings)
            .sort((leftUser, rightUser) => rightUser.amount - leftUser.amount)
            .slice(0, 10);

        if (preparedUsers.length) {
            FileHelper.write(directory, `${rewardId}.txt`, templator({users: preparedUsers}));
        }
    } catch (err) {
        Logger.error(
            `Handle: Error while write template rating info ${reward.title} for ${rewardUser.display_name}`,
            buildErrorFromUnknown(err),
        );
    }
}
