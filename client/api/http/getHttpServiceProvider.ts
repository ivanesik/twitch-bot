import {EServiceProviderKey} from '@/common/types/api/EServiceProviderKey';

import {IServerFetchData} from '@/client/context/ServerFetchContext';

type TConstructor<T> = new (...args: any[]) => T;
export type TProvider<T> = (fetchData?: IServerFetchData) => T;

export function getHttpServiceProvider<IService>(
    browserClass: TConstructor<IService>,
    serverClass: TConstructor<IService> | EServiceProviderKey,
): TProvider<IService> {
    return (fetchData?: IServerFetchData): IService => {
        if (fetchData) {
            return fetchData.moduleRef.get(serverClass);
        } else {
            return new browserClass();
        }
    };
}
