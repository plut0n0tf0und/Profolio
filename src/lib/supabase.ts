import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

function getSupabase() {
    if (supabaseInstance) {
        return supabaseInstance;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || !supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
        // Return a mock or dummy client if env vars are not set
        // to prevent app crash, but auth will not work.
        console.warn('Supabase credentials are not set. Authentication will not work.');
        return {
            auth: {
                signInWithPassword: () => ({ error: { message: 'Supabase not configured.' } }),
                signUp: () => ({ error: { message: 'Supabase not configured.' } }),
                signInWithOAuth: () => ({ error: { message: 'Supabase not configured.' } }),
                signOut: async () => {},
                getUser: async () => ({ data: { user: null }, error: null }),
                resetPasswordForEmail: () => ({ error: { message: 'Supabase not configured.' } }),
            }
        } as any;
    }

    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
}


export const supabase = getSupabase();
