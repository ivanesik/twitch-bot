/* eslint-disable @typescript-eslint/naming-convention */

declare interface Window {
    _SERVER_STATE_: {
        commonStore: import('./store/ICommonStore').ICommonStore;
        supabase: {
            url: string;
            apiKey: string;
        };
    };
}
