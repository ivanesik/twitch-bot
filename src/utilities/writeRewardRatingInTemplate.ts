import _ from 'lodash-es';

import {Logger} from '../logger/logger.mjs';
import {FileHelper} from '../file/FileHelper.mjs';

import type {IRewardRatingsInfo} from '../types/IRewardRatingsInfo.js';
import type {IRewardTemplateInfo} from '../types/IRewardTemplateInfo.js';

import {buildErrorFromUnknown} from './buildErrorFromUnknown.mjs';
import type {ITwitchRewardRedemption} from '../types/TTwitchMessageData.mjs';

export function writeRewardRatingInTemplate(
    directory: string,
    ratingJsonFileName: string,
    rewardRedemption: ITwitchRewardRedemption,
): void {
    const rewardUser = rewardRedemption.user;
    const reward = rewardRedemption.reward;
    const rewardId = reward.id;

    try {
        const rewardRatings: IRewardRatingsInfo =
            FileHelper.readJsonFile(directory, ratingJsonFileName) || {};
        const templates: IRewardTemplateInfo | undefined = FileHelper.readJsonFile(
            directory,
            'templates.json',
        );

        if (templates?.[rewardId]) {
            const templator = _.template(templates[rewardId]);
            const preparedUsers = Object.values(rewardRatings)
                .sort((leftUser, rightUser) => rightUser.amount - leftUser.amount)
                .slice(0, 10);

            if (preparedUsers.length) {
                FileHelper.write(directory, `${rewardId}.txt`, templator({users: preparedUsers}));
            }
        }
    } catch (err) {
        Logger.error(
            `Handle: Error while write template rating info ${reward.title} for ${rewardUser.display_name}`,
            buildErrorFromUnknown(err),
        );
    }
}
