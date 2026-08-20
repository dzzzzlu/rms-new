import { createClient } from "@/lib/supabase/server";
import { Clock, CreditCard, Settings, CheckCircle } from "lucide-react";

export default async function RegistrarDashboard() {
  const supabase = createClient();

  const statuses = ["Pending", "Payment Verification", "Processing", "Ready for Pickup"] as const;
  const counts = await Promise.all(
    statuses.map((s) =>
      supabase.from("requests").select("*", { count: "exact", head: true }).eq("status", s)
    )
  );

  const iconMap = [Clock, CreditCard, Settings, CheckCircle];
  const colorMap = [
    "bg-slate-100 text-slate-600",
    "bg-amber-100 text-amber-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-navy p-8 text-white">
        <p className="text-sm text-white/60">Registrar Portal</p>
        <h2 className="font-heading text-2xl font-bold">Request Overview</h2>
        <p className="mt-1 text-sm text-white/60">Live snapshot of incoming document requests.</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statuses.map((s, i) => {
          const Icon = iconMap[i];
          return (
            <div key={s} className="card flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${colorMap[i]}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">{s}</p>
                <p className="text-2xl font-bold text-navy">{counts[i].count ?? 0}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
