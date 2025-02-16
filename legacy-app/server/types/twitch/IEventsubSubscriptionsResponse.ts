import type {TwitchEventSubTopic} from 'constants/eventSubEvents.mjs';

export interface IEventsubSubscriptionsResponse {
    data: [
        {
            id: string;
            status: 'enabled';
            type: TwitchEventSubTopic;
            version: '1';
            condition: {broadcaster_user_id: string; reward_id: string};
            created_at: string;
            transport: {
                method: 'websocket';
                session_id: string;
                connected_at: string;
            };
            cost: 0;
        },
    ];
    total: 2;
    max_total_cost: 10;
    total_cost: 0;
}
