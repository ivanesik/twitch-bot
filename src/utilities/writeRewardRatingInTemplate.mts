import _ from 'lodash-es';

import type {TRewardTemplate} from '../config/index.mjs';

import {Logger} from '../logger/logger.mjs';
import {FileHelper} from '../file/FileHelper.mjs';

import type {
    IRewardRatingsInfo,
    IRewardRating,
} from '../types/rewardsStorage/IRewardRatingsInfo.mjs';

import {buildErrorFromUnknown} from './buildErrorFromUnknown.mjs';
import type {ITwitchRewardRedemption} from '../types/twitch/TTwitchMessageData.mjs';

interface IRewardRatingTemplateData extends IRewardRating {
    ratingOrder: number;
}

export function writeRewardRatingInTemplate(
    ratingJsonDirectory: string,
    ratingJsonFileName: string,
    templatedDirectory: string,
    templatedFileName: string,
    templateInfo: TRewardTemplate,
    rewardRedemption: ITwitchRewardRedemption,
    isReverse: boolean,
): void {
    const reward = rewardRedemption.reward;

    try {
        const {template, maxUsers} = templateInfo;
        const rewardRatings: IRewardRatingsInfo =
            FileHelper.readJsonFile(ratingJsonDirectory, ratingJsonFileName) || {};

        const templator = _.template(template);
        const preparedUsers = Object.values(rewardRatings)
            .sort((leftUser, rightUser) => {
                const amountDiff = rightUser.amount - leftUser.amount;
                const dateDiff = leftUser.lastRewardDate - rightUser.lastRewardDate;

                return (amountDiff || dateDiff) * (isReverse ? -1 : 1);
            })
            .slice(0, maxUsers)
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
            FileHelper.write(
                templatedDirectory,
                templatedFileName,
                templator({users: preparedUsers}),
            );
        }
    } catch (err) {
        Logger.error(
            `Handle: Error while write template rating info from reward "${reward.title}" to ${templatedFileName}`,
            buildErrorFromUnknown(err),
        );
    }
}
