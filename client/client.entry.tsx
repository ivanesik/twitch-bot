import {render} from 'solid-js/web';

import {App} from './App';

const rootElement = document.getElementById('root');

// TODO: check dev. isDev from 'solid-js/web' doents works
// if (isDev) {
import('solid-devtools');
// }

if (rootElement) {
    render(() => <App />, rootElement);
}
