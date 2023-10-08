import type {ITwitchUser} from '../types/twitch/ITwitchUser.mjs';
import type {
    IRewardRating,
    IRewardRatingsInfo,
} from '../types/rewardsStorage/IRewardRatingsInfo.mjs';

export function updateRewardRating(
    user: ITwitchUser,
    currentRating: IRewardRatingsInfo,
    isIncrease: boolean,
): IRewardRating {
    const {id, display_name: displayName} = user;

    return {
        amount: (currentRating[id]?.amount ?? 0) + (isIncrease ? 1 : -1),
        displayName,
        lastRewardDate: new Date().getTime(),
    };
}
