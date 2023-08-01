import zod from 'zod';

const DEFAULT_MAX_USERS = 10;

export const templateSchema = zod.object({
    template: zod
        .string()
        .describe(
            '@example "Top 10 in chat: <% _.forEach(users, function(user, index) { %>#<%- index %> <%- user.displayName %> (<%- user.amount / 10 %>см), <% }); %>"',
        ),
    maxUsers: zod.number().min(1).max(100).default(DEFAULT_MAX_USERS),
});
const templateInfoSchema = zod.object({
    normal: templateSchema.optional().describe(`
        Template for users from Top to Bottom.
        For example users in template will be [userTop1, userTop2, userTop3, ...]
    `),
    reverse: templateSchema.optional().describe(`
        Template for users from Bottom to Top.
        For example users in template will be [userTop1000, userTop999, userTop998, ...]
    `),
});
const templatesInfoSchema = zod.record(templateInfoSchema);

export const opositeRewardsSchema = zod.object({
    targetRewardId: zod.string(),
    opositeRewardId: zod.string(),
});

export const configSchema = zod.object({
    templates: templatesInfoSchema.optional(),
    opositeRewards: zod.array(opositeRewardsSchema).optional(),
});
