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
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
                    Analytics Deep Dive
                </h1>
                <p className="text-muted-foreground font-medium mt-1">
                    Advanced performance metrics and statistical breakdown.
                </p>
            </div>

            <AnalyticsDashboard />
        </div>
    );
}
