import {Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';

import {ITwitchUser} from '@/common/types/dto/ITwitchUser';
import {ITwitchHttpClient} from '@/common/types/api/ITwitchHttpClient';
import type {ITwitchValidateTokenResponse} from './types/ITwitchValidateTokenResponse';

@Injectable()
export class TwitchHttpClient implements ITwitchHttpClient {
    constructor(private readonly httpService: HttpService) {}

    async validateAccessToken(accessToken: string): Promise<ITwitchUser> {
        const timestamp = new Date().valueOf();
        const {data} =
            await this.httpService.axiosRef.get<ITwitchValidateTokenResponse>(
                'https://id.twitch.tv/oauth2/validate',
                {
                    headers: {Authorization: `OAuth ${accessToken}`},
                },
            );

        return {
            twitchLogin: data.login,
            twitchScopes: data.scopes,
            twitchToken: accessToken,
            twitchTokenExpiresIn: data.expires_in,
            twitchUserId: data.user_id,
            timestamp,
        };
    }
}
