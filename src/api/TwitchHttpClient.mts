import {HeadersInit} from 'node-fetch';
import {logAction} from '../logger/logMethod.mjs';

interface IGetTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: 'bearer';
}

interface IGetUsersResponse {
    data: [
        {
            id: string;
            login: string;
            display_name: string;
            type: 'admin' | 'global_mod' | 'staff' | '';
            broadcaster_type: 'affiliate' | 'partner' | '';
            description: string;
            profile_image_url: string;
            offline_image_url: string;
            view_count: number;
            created_at: `${number}-${number}-${number}T${number}:${number}:${number}Z`;
        },
    ];
}

export class TwitchHttpClient {
    constructor(private clientId: string, private clientSecret: string) {}

    @logAction('Getting access token')
    async getAccessToken(): Promise<string> {
        const response = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials',
            }),
        });

        if (!response) {
            return '';
        }

        const {access_token} = (await response.json()) as IGetTokenResponse;

        return access_token;
    }

    @logAction('Getting user id by login')
    async getUserIdByLogin(login: string, accessToken: string): Promise<string> {
        const response = await fetch(`https://api.twitch.tv/helix/users?login=${login}`, {
            method: 'GET',
            headers: {
                'Client-ID': this.clientId,
                Authorization: 'Bearer ' + accessToken,
            },
        });

        const result = (await response.json()) as IGetUsersResponse;

        return result.data?.[0]?.id;
    }
}
