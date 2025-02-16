import type {
    IRewardRating,
    IRewardRatingsInfo,
} from '../types/rewardsStorage/IRewardRatingsInfo.mjs';

export function updateRewardRating(
    userId: string,
    userName: string,
    currentRating: IRewardRatingsInfo,
    isIncrease: boolean,
): IRewardRating {
    return {
        amount: (currentRating[userId]?.amount ?? 0) + (isIncrease ? 1 : -1),
        displayName: userName,
        lastRewardDate: new Date().getTime(),
    };
}
