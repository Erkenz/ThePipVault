import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AccountForm from "./account-form";

export default async function AccountPage() {
    const supabase = await createClient();

    // 1. Check Auth (Server Side)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    // 2. Fetch Profile Data (Server Side)
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // 3. Render Client Component with initial data
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
            <header className="flex flex-col gap-2 border-b border-border/40 pb-6">
                <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Account Management</span>
                </h1>
                <p className="text-muted-foreground font-medium">Manage your profile details and trading accounts.</p>
            </header>

            {/* Client Form */}
            <AccountForm user={user} profile={profile} />
        </div>
    );
}
