import {createContext} from 'solid-js';
import type {SupabaseClient} from '@supabase/supabase-js';

export const SupabaseContext = createContext<SupabaseClient>();
