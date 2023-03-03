import _ from 'lodash-es';

import {Logger} from '../logger/logger.mjs';
import {FileHelper} from '../file/FileHelper.mjs';

import type {IRewardRatingsInfo} from '../types/rewardsStorage/IRewardRatingsInfo.mjs';

import {buildErrorFromUnknown} from './buildErrorFromUnknown.mjs';
import type {ITwitchRewardRedemption} from '../types/twitch/TTwitchMessageData.mjs';

export function writeRewardRatingInTemplate(
    directory: string,
    ratingJsonFileName: string,
    templatedFileName: string,
    template: string,
    rewardRedemption: ITwitchRewardRedemption,
): void {
    const reward = rewardRedemption.reward;

    try {
        const rewardRatings: IRewardRatingsInfo =
            FileHelper.readJsonFile(directory, ratingJsonFileName) || {};

        const templator = _.template(template);
        const preparedUsers = Object.values(rewardRatings)
            .sort((leftUser, rightUser) => rightUser.amount - leftUser.amount)
            .slice(0, 10);

        if (preparedUsers.length) {
            FileHelper.write(directory, templatedFileName, templator({users: preparedUsers}));
        }
    } catch (err) {
        Logger.error(
            `Handle: Error while write template rating info from reward "${reward.title}" to ${templatedFileName}`,
            buildErrorFromUnknown(err),
        );
    }
}
