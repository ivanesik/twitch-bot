import {logAction} from '../logger/logMethod.mjs';

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
    constructor(private clientId: string) {}

    @logAction('Validate access token')
    async validateAccessToken(accessToken: string): Promise<boolean> {
        const response = await fetch('https://id.twitch.tv/oauth2/validate', {
            method: 'GET',
            headers: {Authorization: `OAuth ${accessToken}`},
        });

        if (response.status === 200) {
            return true;
        } else {
            return false;
        }
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
