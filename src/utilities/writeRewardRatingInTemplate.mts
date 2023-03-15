import _ from 'lodash-es';

import {Logger} from '../logger/logger.mjs';
import {FileHelper} from '../file/FileHelper.mjs';

import type {
    IRewardRatingsInfo,
    IRewardRating,
} from '../types/rewardsStorage/IRewardRatingsInfo.mjs';

import {buildErrorFromUnknown} from './buildErrorFromUnknown.mjs';
import type {ITwitchRewardRedemption} from '../types/twitch/TTwitchMessageData.mjs';
import type {IRewardTemplateInfo} from '../types/rewardsStorage/IRewardRatingConfig.mjs';

const DEFAULT_MAX_USERS = 10;

interface IRewardRatingTemplateData extends IRewardRating {
    ratingOrder: number;
}

export function writeRewardRatingInTemplate(
    directory: string,
    ratingJsonFileName: string,
    templatedFileName: string,
    templateInfo: IRewardTemplateInfo,
    rewardRedemption: ITwitchRewardRedemption,
): void {
    const reward = rewardRedemption.reward;

    try {
        const {template, maxUsers} = templateInfo;
        const rewardRatings: IRewardRatingsInfo =
            FileHelper.readJsonFile(directory, ratingJsonFileName) || {};

        const templator = _.template(template);
        const preparedUsers = Object.values(rewardRatings)
            .sort((leftUser, rightUser) => {
                const amountDiff = rightUser.amount - leftUser.amount;
                const dateDiff = rightUser.lastRewardDate - leftUser.lastRewardDate;

                return amountDiff || dateDiff;
            })
            .slice(0, maxUsers || DEFAULT_MAX_USERS)
            .reduce<IRewardRatingTemplateData[]>((acc, currentUser, index) => {
                const previousUser: IRewardRatingTemplateData | undefined = acc[index - 1];
                const ratingOrder =
                    previousUser && previousUser.amount === currentUser.amount
                        ? previousUser.ratingOrder
                        : index + 1;

                acc.push({
                    ...currentUser,
                    ratingOrder,
                });

                return acc;
            }, []);

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
