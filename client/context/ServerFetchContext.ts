import {ModuleRef} from '@nestjs/core';
import {createContext} from 'solid-js';

import type {IAppRequest} from '@/server/types/IAppRequest';

export interface IServerFetchData {
    request: IAppRequest;
    moduleRef: ModuleRef;
}

export const ServerFetchContext = createContext<IServerFetchData>();
