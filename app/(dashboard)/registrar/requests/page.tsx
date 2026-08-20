"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STATUSES = [
  "Pending",
  "Payment Verification",
  "Processing",
  "Ready for Pickup",
  "Completed",
  "Rejected",
] as const;

const STATUS_COLOR: Record<string, string> = {
  Pending: "badge-pending",
  "Payment Verification": "badge-verification",
  Processing: "badge-processing",
  "Ready for Pickup": "badge-ready",
  Completed: "badge-completed",
  Rejected: "badge-rejected",
};

export default function ManageRequestsPage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("requests")
      .select("id, tracking_code, purpose, copies, status, created_at, documents(name), profiles(full_name, student_number)")
      .order("created_at", { ascending: false });
    setRequests(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: number, status: string) {
    await supabase.from("requests").update({ status }).eq("id", id);
    await supabase.from("status_history").insert({ request_id: id, status });
    load();
  }

  const visible = filter === "All" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy">Manage Requests</h2>
          <p className="text-sm text-gray-400">Update status as requests move through processing.</p>
        </div>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="card text-sm text-gray-400">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="card text-sm text-gray-400">No requests in this view.</div>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => (
            <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-navy">
                  {r.documents?.name} — {r.profiles?.full_name}
                </p>
                <p className="text-xs text-gray-400">
                  {r.tracking_code} · {r.profiles?.student_number ?? "—"} ·{" "}
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${STATUS_COLOR[r.status] ?? "badge-pending"}`}>{r.status}</span>
                <select
                  className="input w-auto"
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
