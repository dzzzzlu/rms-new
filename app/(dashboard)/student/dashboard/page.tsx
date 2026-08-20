import { createClient, getProfile } from "@/lib/supabase/server";
import { FileText, BookOpen, Hash } from "lucide-react";

export default async function StudentDashboard() {
  const profile = await getProfile();
  const supabase = createClient();

  const { count: totalRequests } = await supabase
    .from("requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile!.id);

  const { data: recent } = await supabase
    .from("requests")
    .select("id, tracking_code, status, created_at, documents(name)")
    .eq("user_id", profile!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Pending: "badge-pending",
      "Payment Verification": "badge-verification",
      Processing: "badge-processing",
      "Ready for Pickup": "badge-ready",
      Completed: "badge-completed",
      Rejected: "badge-rejected",
    };
    return map[status] ?? "badge-pending";
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-navy p-8 text-white">
        <p className="text-sm text-white/60">Welcome back,</p>
        <h2 className="font-heading text-2xl font-bold">{profile?.full_name}</h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy/5">
            <FileText className="text-navy" size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Total Requests</p>
            <p className="text-2xl font-bold text-navy">{totalRequests ?? 0}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy/5">
            <BookOpen className="text-navy" size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Course</p>
            <p className="text-lg font-semibold text-navy">{profile?.course ?? "—"}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy/5">
            <Hash className="text-navy" size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Student Number</p>
            <p className="text-lg font-semibold text-navy">{profile?.student_number ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card">
        <h3 className="mb-4 font-heading font-semibold text-navy">Recent Requests</h3>
        {!recent || recent.length === 0 ? (
          <p className="text-sm text-gray-400">No requests yet. Use "New Request" to get started.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((r: any) => (
              <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700">{r.documents?.name}</p>
                  <p className="text-xs text-gray-400">{r.tracking_code}</p>
                </div>
                <span className={`badge ${statusBadge(r.status)}`}>{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
