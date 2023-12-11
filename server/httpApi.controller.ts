import {Controller, Post, Body} from '@nestjs/common';

import {saveTokenApi} from '@/common/constants/httpApiPath';
import {saveTokenErrorByStatus} from './constants/errorMessagesByStatus';

import {IApiService} from '@/common/types/api/IApiService';

import {handleAxiosError} from './utilities/handleAxiosError';

import {TwitchHttpClient} from './services/twitchHttpClient.service';

@Controller('api')
export class HttpApiController implements IApiService {
    constructor(private readonly twitchHttpClient: TwitchHttpClient) {
        this.twitchHttpClient = twitchHttpClient;
    }

    @Post(saveTokenApi)
    async saveToken(@Body('accessToken') accessToken: string) {
        return this.twitchHttpClient
            .validateAccessToken(accessToken)
            .catch(error => handleAxiosError(error, saveTokenErrorByStatus));
    }
}
