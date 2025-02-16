import _ from 'lodash-es';

import type {
    IRewardRatingsInfo,
    IRewardRating,
} from '../types/rewardsStorage/IRewardRatingsInfo.mjs';
import type {IRewardFilesInfo} from '../types/rewardsStorage/IRewardFilesInfo.mjs';
import type {ITwitchNotificationPayloadEvent} from '../types/twitch/TTwitchMessageData.mjs';

import {FileHelper} from '../file/FileHelper.mjs';
import {Logger} from '../logger/logger.mjs';

import {buildErrorFromUnknown} from './buildErrorFromUnknown.mjs';

interface IRewardRatingTemplateData extends IRewardRating {
    ratingOrder: number;
}

export function writeRewardRatingInTemplate(
    ratingJsonDirectory: string,
    templatedDirectory: string,
    rewardRedemption: ITwitchNotificationPayloadEvent,
    filesInfo: IRewardFilesInfo,
    isReverse: boolean,
): void {
    const {
        template: templateInfo,
        rewardRatingFileName: ratingJsonFileName,
        templateRewardRatingFileName: templatedFileName,
    } = filesInfo;
    const reward = rewardRedemption.reward;

    if (!templateInfo) {
        return;
    }

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
