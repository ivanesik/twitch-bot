export interface IRewardTemplateInfo {
    /**
     * @example "Top 10 in chat: <% _.forEach(users, function(user, index) { %>#<%- index %> <%- user.displayName %> (<%- user.amount / 10 %>см), <% }); %>"
     */
    [rewardId: string]: string;
}
