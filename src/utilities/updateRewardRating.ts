import type {IRewardRatingsInfo} from '../types/IRewardRatingsInfo';
import type {ITwitchRewardRedemption} from '../types/TTwitchMessageData.mjs';

export function updateRewardRating(
    rewardRedemption: ITwitchRewardRedemption,
    currentRating: IRewardRatingsInfo,
): void {
    const {
        user: {id, display_name: displayName},
    } = rewardRedemption;

    currentRating[id] = {
        amount: currentRating[id]?.amount ? currentRating[id]?.amount + 1 : 1,
        displayName,
    };
}
