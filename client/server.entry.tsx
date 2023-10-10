import type {Request} from 'express';
import {Store} from 'solid-js/store';
import {Router} from '@solidjs/router';
import {LoggerService} from '@nestjs/common';
import {renderToStringAsync} from 'solid-js/web';

import {ICommonStore} from '@/types/store/ICommonStore';

import {OriginContext} from './context/OriginContext';
import {CommonInfoContext} from './context/CommonInfoContext';

import {App} from './App';

export async function render(
    request: Request,
    logger: LoggerService,
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
                <Router url={url}>
                    <App />
                </Router>
            </CommonInfoContext.Provider>
        </OriginContext.Provider>
    ));

    logger.log(`[serverEntry.render] Complete: ${url}`);

    return appString;
}

export type TRenderFunction = typeof render;
