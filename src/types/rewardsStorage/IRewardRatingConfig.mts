export interface IRewardTemplate {
    /**
     * @example "Top 10 in chat: <% _.forEach(users, function(user, index) { %>#<%- index %> <%- user.displayName %> (<%- user.amount / 10 %>см), <% }); %>"
     */
    template: string;
    /** @default 10 */
    maxUsers?: number;
}

export interface IRewardTemplateInfo {
    /**
     * Template for users from Top to Bottom.
     * For example users in template will be [userTop1, userTop2, userTop3, ...]
     */
    normal?: IRewardTemplate;
    /**
     * Template for users from Bottom to Top.
     * For example users in template will be [userTop1000, userTop999, userTop998, ...]
     */
    reverse?: IRewardTemplate;
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
