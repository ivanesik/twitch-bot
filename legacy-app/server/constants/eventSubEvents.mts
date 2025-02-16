export const twitchEventSubTopics = {
    /** A custom reward is redeemed in a channel.  */
    channelRewardRedemption: 'channel.channel_points_custom_reward_redemption.add',
} as const;

export type TwitchEventSubTopic = (typeof twitchEventSubTopics)[keyof typeof twitchEventSubTopics];
