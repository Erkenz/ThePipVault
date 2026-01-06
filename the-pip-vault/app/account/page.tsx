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
        <div className="min-h-screen bg-pip-dark py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="border-b border-pip-border pb-6">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Account Settings</h1>
                    <p className="text-pip-muted">Manage your profile and account preferences.</p>
                </div>

                {/* Client Form */}
                <AccountForm user={user} profile={profile} />

            </div>
        </div>
    );
}
