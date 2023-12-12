import {Controller, Post, Body, Inject} from '@nestjs/common';

import {saveTokenApi} from '@/common/constants/httpApiPath';
import {saveTokenErrorByStatus} from './constants/errorMessagesByStatus';

import {ITwitchHttpClient} from '@/common/types/api/ITwitchHttpClient';
import {EServiceProviderKey} from '@/common/types/api/EServiceProviderKey';

import {handleAxiosError} from './utilities/handleAxiosError';

@Controller('api')
export class HttpApiController {
    twitchHttpClient: ITwitchHttpClient;

    constructor(
        @Inject(EServiceProviderKey.TWITCH_HTTP_CLIENT)
        twitchHttpClient: ITwitchHttpClient,
    ) {
        this.twitchHttpClient = twitchHttpClient;
    }

    @Post(saveTokenApi)
    async saveToken(@Body('accessToken') accessToken: string) {
        return this.twitchHttpClient
            .validateAccessToken(accessToken)
            .catch(error => handleAxiosError(error, saveTokenErrorByStatus));
    }
}
