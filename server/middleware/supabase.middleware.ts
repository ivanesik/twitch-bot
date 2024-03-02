import {Injectable, NestMiddleware} from '@nestjs/common';
import {Response, NextFunction} from 'express';
import {ConfigService} from '@nestjs/config';
import {createSupabaseClient} from '@supabase/auth-helpers-shared';

import {IAppRequest} from '@/server/types/IAppRequest';

import {ExpressCookieAuthStorageAdapter} from '../utilities/ExpressCookieAuthStorageAdapter';

// TODO: try to save supabaseClient not in Req, but another place (service/etc.)
@Injectable()
export class SupabaseMiddleware implements NestMiddleware {
    constructor(private readonly configService: ConfigService) {}

    use(req: IAppRequest, res: Response, next: NextFunction) {
        const supabaseUrl = this.getUrl();
        const supabaseApiKey = this.getApiKey();

        const supabaseClient = createSupabaseClient(
            supabaseUrl,
            supabaseApiKey,
            {
                auth: {
                    storage: new ExpressCookieAuthStorageAdapter(req, res),
                },
            },
        );

        req.supabase = {
            client: supabaseClient,
            options: {
                url: supabaseUrl,
                apiKey: supabaseApiKey,
            },
        };

        next();
    }

    public getUrl(): string {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');

        if (!supabaseUrl) {
            throw new Error('No supabaseUrl in render service');
        }

        return supabaseUrl;
    }

    public getApiKey(): string {
        const supabaseApiKey =
            this.configService.get<string>('SUPABASE_API_KEY');

        if (!supabaseApiKey) {
            throw new Error('No supabaseApiKey in render service');
        }

        return supabaseApiKey;
    }
}
