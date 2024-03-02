import {Store} from 'solid-js/store';
import {ModuleRef} from '@nestjs/core';
import {Router} from '@solidjs/router';
import {LoggerService} from '@nestjs/common';
import {renderToStringAsync} from 'solid-js/web';
import {type SupabaseClient} from '@supabase/supabase-js';

import {ICommonStore} from '@/common/types/store/ICommonStore';
import {IAppRequest} from '@/server/types/IAppRequest';

import {OriginContext} from './context/OriginContext';
import {SupabaseContext} from './context/SupabaseContent';
import {CommonInfoContext} from './context/CommonInfoContext';
import {ServerFetchContext} from './context/ServerFetchContext';

import {App} from './App';

interface IRenderOptions {
    request: IAppRequest;
    logger: LoggerService;
    moduleRef: ModuleRef;
    store: Store<ICommonStore>;
    supabaseClient: SupabaseClient;
}

export async function render(options: IRenderOptions) {
    const {request, logger, moduleRef, store, supabaseClient} = options;
    const {
        url,
        headers: {host},
    } = request;

    logger.log(`[serverEntry.render] Start: ${url}`);

    // TODO: think about providers tree builder
    const appString = await renderToStringAsync(() => (
        <OriginContext.Provider value={`http://${host}`}>
            <CommonInfoContext.Provider value={store}>
                <ServerFetchContext.Provider value={{request, moduleRef}}>
                    <SupabaseContext.Provider value={supabaseClient}>
                        <Router url={url}>
                            <App />
                        </Router>
                    </SupabaseContext.Provider>
                </ServerFetchContext.Provider>
            </CommonInfoContext.Provider>
        </OriginContext.Provider>
    ));

    logger.log(`[serverEntry.render] Complete: ${url}`);

    return appString;
}

export type TRenderFunction = typeof render;
