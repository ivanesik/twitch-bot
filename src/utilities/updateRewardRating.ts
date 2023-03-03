import type {ITwitchUser} from '../types/ITwitchUser';
import type {IRewardRating, IRewardRatingsInfo} from '../types/IRewardRatingsInfo';

export function updateRewardRating(
    user: ITwitchUser,
    currentRating: IRewardRatingsInfo,
): IRewardRating {
    const {id, display_name: displayName} = user;

    return {
        amount: (currentRating[id]?.amount ?? 0) + 1,
        displayName,
    };
}