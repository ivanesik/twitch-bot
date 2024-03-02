import type {Response} from 'express';
import {
    type CookieOptions,
    CookieAuthStorageAdapter,
} from '@supabase/auth-helpers-shared';

import type {IAppRequest} from '@/server/types/IAppRequest';

export class ExpressCookieAuthStorageAdapter extends CookieAuthStorageAdapter {
    req: IAppRequest;
    res: Response;

    constructor(
        req: IAppRequest,
        res: Response,
        cookieOptions?: CookieOptions,
    ) {
        super(cookieOptions);

        this.req = req;
        this.res = res;
    }

    protected getCookie(name: string) {
        return this.req.cookies[name];
    }

    protected setCookie(name: string, value: string) {
        this.res.cookie(name, encodeURIComponent(value), {
            sameSite: 'lax',
            httpOnly: true,
        });
    }

    protected deleteCookie(name: string) {
        this.res.clearCookie(name);
    }
}
