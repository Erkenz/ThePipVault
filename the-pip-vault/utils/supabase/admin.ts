import { createClient } from '@supabase/supabase-js'

export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        // Return null or throw a specific error that can be caught
        throw new Error("Failed to initialize Admin Client: Missing NEXT_PUBLIC_SUPABASE_URL or SERVICE_KEY");
    }

    return createClient(
        supabaseUrl,
        serviceKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
