import {DEV} from 'solid-js';
import {hydrate} from 'solid-js/web';
import {Router} from '@solidjs/router';
import {createStore} from 'solid-js/store';
import {createClient} from '@supabase/supabase-js';
import {BrowserCookieAuthStorageAdapter} from '@supabase/auth-helpers-shared';

import {ICommonStore} from '@/common/types/store/ICommonStore';

import {OriginContext} from './context/OriginContext';
import {SupabaseContext} from './context/SupabaseContent';
import {CommonInfoContext} from './context/CommonInfoContext';
import {ServerFetchContext} from './context/ServerFetchContext';

import {App} from './App';

const rootElement = document.getElementById('root');
const {commonStore, supabase} = self._SERVER_STATE_;
const [store] = createStore<ICommonStore>(commonStore);

const supabaseClient = createClient(supabase.url, supabase.apiKey, {
    auth: {
        storage: new BrowserCookieAuthStorageAdapter(),
    },
});

if (DEV) {
    import('solid-devtools');
}

if (rootElement) {
    hydrate(
        () => (
            <OriginContext.Provider value={location.origin}>
                <CommonInfoContext.Provider value={store}>
                    <ServerFetchContext.Provider value={undefined}>
                        <SupabaseContext.Provider value={supabaseClient}>
                            <Router>
                                <App />
                            </Router>
                        </SupabaseContext.Provider>
                    </ServerFetchContext.Provider>
                </CommonInfoContext.Provider>
            </OriginContext.Provider>
        ),
        rootElement,
    );
}
