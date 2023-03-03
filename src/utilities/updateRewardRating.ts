import type {IRewardRatingsInfo} from '../types/IRewardRatingsInfo';
import type {ITwitchRewardRedemption} from '../types/TTwitchMessageData.mjs';

export function updateRewardRating(
    rewardRedemption: ITwitchRewardRedemption,
    currentRating: IRewardRatingsInfo,
): void {
    const {
        user: {id, display_name: displayName},
    } = rewardRedemption;

}
