export interface IRewardRating {
    displayName: string;
    amount: number;
    /** Timestamp in UTC */
    lastRewardDate: number;
}

export interface IRewardRatingsInfo {
    [userIdDisplayName: string]: IRewardRating;
}
