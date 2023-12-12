import {useContext} from 'solid-js';

import {TProvider} from '../api/http/getHttpServiceProvider';

import {ServerFetchContext} from '../context/ServerFetchContext';

export function useService<T>(provider: TProvider<T>) {
    const context = useContext(ServerFetchContext);

    return provider(context);
}
