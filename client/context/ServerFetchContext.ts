import {ModuleRef} from '@nestjs/core';
import type {Request} from 'express';
import {createContext} from 'solid-js';

export interface IServerFetchData {
    request: Request;
    moduleRef: ModuleRef;
}

export const ServerFetchContext = createContext<IServerFetchData>();
