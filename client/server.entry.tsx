import type {Request} from 'express';
import {Store} from 'solid-js/store';
import {ModuleRef} from '@nestjs/core';
import {LoggerService} from '@nestjs/common';
import {renderToStringAsync} from 'solid-js/web';
import {Router} from '@solidjs/router';

import {ICommonStore} from '@/common/types/store/ICommonStore';

import {OriginContext} from './context/OriginContext';
import {CommonInfoContext} from './context/CommonInfoContext';
import {ServerFetchContext} from './context/ServerFetchContext';

import {App} from './App';

export async function render(
    request: Request,
    logger: LoggerService,
    moduleRef: ModuleRef,
    store: Store<ICommonStore>,
) {
    const {
        url,
        headers: {origin},
    } = request;

    logger.log(`[serverEntry.render] Start: ${url}`);

    const appString = await renderToStringAsync(() => (
        <OriginContext.Provider value={origin}>
            <CommonInfoContext.Provider value={store}>
                <ServerFetchContext.Provider value={{request, moduleRef}}>
                    <Router url={url}>
                        <App />
                    </Router>
                </ServerFetchContext.Provider>
            </CommonInfoContext.Provider>
        </OriginContext.Provider>
    ));

    logger.log(`[serverEntry.render] Complete: ${url}`);

    return appString;
}

export type TRenderFunction = typeof render;
