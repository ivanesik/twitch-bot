import {hydrate} from 'solid-js/web';
import {Router} from '@solidjs/router';
import {createStore} from 'solid-js/store';

import {ICommonStore} from '@/types/store/ICommonStore';

import {OriginContext} from './context/OriginContext';
import {CommonInfoContext} from './context/CommonInfoContext';

import {App} from './App';

const rootElement = document.getElementById('root');
const {commonStore} = self._SERVER_STATE_;
const [store] = createStore<ICommonStore>(commonStore);

// TODO: check dev. isDev from 'solid-js/web' doents works
// if (isDev) {
import('solid-devtools');
// }

if (rootElement) {
    hydrate(
        () => (
            <OriginContext.Provider value={location.origin}>
                <CommonInfoContext.Provider value={store}>
                    <Router>
                        <App />
                    </Router>
                </CommonInfoContext.Provider>
            </OriginContext.Provider>
        ),
        rootElement,
    );
}
