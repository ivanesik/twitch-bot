import type {IGetUsersResponse, ITwitchUserFromResponse} from 'types/twitch/IGetUsersResponse.js';
import type {ITwitchValidateTokenResponse} from 'types/twitch/ITwitchValidateTokenResponse.js';

import {logAction} from '../logger/logMethod.mjs';
import type {IEventsubSubscriptionsResponse} from 'types/twitch/IEventsubSubscriptionsResponse';

type IValidateAccessTokenResult =
    | {isValid: true; result: ITwitchValidateTokenResponse}
    | {isValid: false};

export class TwitchHttpClient {
    constructor(
        private clientId: string,
        private accessToken: string,
    ) {}

    @logAction('Validate access token')
    async validateAccessToken(): Promise<IValidateAccessTokenResult> {
        const response = await fetch('https://id.twitch.tv/oauth2/validate', {
            method: 'GET',
            headers: {Authorization: `OAuth ${this.accessToken}`},
        });

        if (response.status === 200) {
            const result: ITwitchValidateTokenResponse = await response.json();

            return {isValid: true, result};
        } else {
            return {isValid: false};
        }
    }

    @logAction('Getting user by login')
    async getUserByLogin(login: string): Promise<ITwitchUserFromResponse | undefined> {
        const response = await fetch(`https://api.twitch.tv/helix/users?login=${login}`, {
            method: 'GET',
            headers: {
                'Client-ID': this.clientId,
                Authorization: 'Bearer ' + this.accessToken,
            },
        });

        const result = (await response.json()) as IGetUsersResponse;

        return result.data?.[0];
    }

    @logAction('Getting user by login')
    async subscribeToEvents(params: {
        scope: string;
        sessionId: string;
        userId: string;
    }): Promise<IEventsubSubscriptionsResponse> {
        const {sessionId, userId, scope} = params;

        const response = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions`, {
            method: 'POST',
            headers: {
                'Client-ID': this.clientId,
                Authorization: 'Bearer ' + this.accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: scope,
                version: '1',
                condition: {broadcaster_user_id: userId},
                transport: {
                    method: 'websocket',
                    session_id: sessionId,
                },
            }),
        });

        return (await response.json()) as IEventsubSubscriptionsResponse;
    }
}
