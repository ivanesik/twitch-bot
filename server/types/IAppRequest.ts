import {Request} from 'express';
import {type SupabaseClient} from '@supabase/supabase-js';

export interface IAppRequest extends Request {
    supabase: {
        client: SupabaseClient;
        options: {
            url: string;
            apiKey: string;
        };
    };
}
