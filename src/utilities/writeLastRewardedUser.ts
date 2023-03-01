import {Logger} from '../logger/logger.mjs';
import {FileHelper} from '../file/FileHelper.mjs';

import type {ITwitchRewardRedemption} from '../types/TTwitchMessageData.mjs';

import {buildErrorFromUnknown} from './buildErrorFromUnknown.mjs';

export function writeLastRewardedUser(
    directory: string,
    rewardRedemption: ITwitchRewardRedemption,
) {
    const {user, reward} = rewardRedemption;
    const rewardId = reward.id;

    try {
        FileHelper.write(directory, `${rewardId}.txt`, user.display_name);
    } catch (err) {
        Logger.error(
            `Handle: Error while write reward ${reward.title} for ${user.display_name}`,
            buildErrorFromUnknown(err),
        );
    }
}
