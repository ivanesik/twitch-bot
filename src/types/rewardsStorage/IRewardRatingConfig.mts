export interface IRewardTemplateInfo {
    /**
     * @example "Top 10 in chat: <% _.forEach(users, function(user, index) { %>#<%- index %> <%- user.displayName %> (<%- user.amount / 10 %>см), <% }); %>"
     */
    template: string;
    maxUsers?: number;
}

export interface IRewardTemplatesInfo {
    [rewardId: string]: IRewardTemplateInfo;
}

export interface IOpositeRewardInfo {
    targetRewardId: string;
    opositeRewardId: string;
}

export interface IRewardRatingConfig {
    templates?: IRewardTemplatesInfo;
    opositeRewards?: IOpositeRewardInfo[];
}
