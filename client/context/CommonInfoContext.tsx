import {useContext, createContext} from 'solid-js';
import {Store} from 'solid-js/store';

import {ICommonStore} from '../../types/store/ICommonStore';

export const CommonInfoContext = createContext<Store<ICommonStore>>();

export function useClientId() {
    return useContext(CommonInfoContext)?.clientId;
}
