import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // The `requestUrl` yields the URL that was requested, e.g. https://yoursite.com/auth/callback?code=...
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // If exchange is successful, redirect to the intended page (or dashboard)
            const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development';

            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no x-forwarded-host
                return NextResponse.redirect(`${requestUrl.origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${requestUrl.origin}${next}`);
            }
        }
    }

    // If exchange fails or no code, redirect to error page
    // return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    // For now, redirect to login with error
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Could not verify email`);
}
