import { createClient } from "@/lib/supabase/server";
import { Users, FileText, Activity } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = createClient();

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  const { count: requestCount } = await supabase
    .from("requests")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-navy p-8 text-white">
        <p className="text-sm text-white/60">Admin Portal</p>
        <h2 className="font-heading text-2xl font-bold">System Overview</h2>
        <p className="mt-1 text-sm text-white/60">Institution-wide snapshot.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy/5">
            <Users className="text-navy" size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Total Users</p>
            <p className="text-2xl font-bold text-navy">{userCount ?? 0}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy/5">
            <FileText className="text-navy" size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Total Requests</p>
            <p className="text-2xl font-bold text-navy">{requestCount ?? 0}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <Activity className="text-emerald-600" size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">System Status</p>
            <p className="text-lg font-semibold text-emerald-600">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
