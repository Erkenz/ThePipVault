import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

export default async function AnalyticsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background text-pip-text">
            <div className="p-6">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-pip-text uppercase tracking-tighter italic">Analytics</h1>
                        <p className="text-pip-muted">Deep dive into your trading performance.</p>
                    </div>
                </div>

                <AnalyticsDashboard />
            </div>
        </div>
    );
}
