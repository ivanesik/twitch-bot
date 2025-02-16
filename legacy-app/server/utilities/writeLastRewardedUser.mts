import type {ITwitchNotificationPayloadEvent} from 'types/twitch/TTwitchMessageData.mjs';

import {Logger} from '../logger/logger.mjs';
import {FileHelper} from '../file/FileHelper.mjs';

import {buildErrorFromUnknown} from './buildErrorFromUnknown.mjs';

export function writeLastRewardedUser(
    directory: string,
    rewardRedemption: ITwitchNotificationPayloadEvent,
) {
    const {user_name, reward} = rewardRedemption;
    const {id: rewardId, title: rewardTitle} = reward;

    try {
        FileHelper.write(directory, `${rewardId}.txt`, user_name);
    } catch (err) {
        Logger.error(
            `Handle: Error while write reward ${rewardTitle} for ${user_name}`,
            buildErrorFromUnknown(err),
        );
    }
}
