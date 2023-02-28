interface IRewardRating {
    displayName: string;
    amount: number;
}

export interface IRewardRatingsInfo {
    [userIdDisplayName: string]: IRewardRating;
}
