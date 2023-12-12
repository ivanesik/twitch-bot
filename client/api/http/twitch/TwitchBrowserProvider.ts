import axios, {AxiosInstance} from 'axios';

import {saveTokenApi} from '@/common/constants/httpApiPath';

import {ITwitchUser} from '@/common/types/dto/ITwitchUser';
import {ITwitchHttpClient} from '@/common/types/api/ITwitchHttpClient';

export class TwitchBrowserProvider implements ITwitchHttpClient {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: '/api/',
        });
    }

    public async validateAccessToken(accessToken: string) {
        const {data} = await this.axiosInstance.post<ITwitchUser>(
            saveTokenApi,
            {accessToken},
        );

        return data;
    }
}
