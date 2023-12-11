import axios, {AxiosInstance} from 'axios';

import {saveTokenApi} from '@/common/constants/httpApiPath';

import {ITwitchUser} from '@/common/types/dto/ITwitchUser';
import {IApiService} from '@/common/types/api/IApiService';

class HttpApiClient implements IApiService {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: '/api/',
        });
    }

    public async saveToken(accessToken: string) {
        const {data} = await this.axiosInstance.post<ITwitchUser>(
            saveTokenApi,
            {accessToken},
        );

        return data;
    }
}

export const httpApiClient = new HttpApiClient();
