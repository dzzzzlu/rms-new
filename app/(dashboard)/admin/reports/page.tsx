"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download } from "lucide-react";

export default function AdminReportsPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, role, is_active, created_at")
        .order("created_at", { ascending: false });
      setUsers(data ?? []);
      setLoading(false);
    })();
  }, []);

  function downloadCsv() {
    const header = ["Name", "Email", "Role", "Active", "Joined"];
    const lines = users.map((u) => [
      u.full_name,
      u.email,
      u.role,
      u.is_active ? "Yes" : "No",
      new Date(u.created_at).toLocaleDateString(),
    ]);
    const csv = [header, ...lines].map((l) => l.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-report.csv";
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy">Reports</h2>
          <p className="text-sm text-gray-400">{users.length} total accounts</p>
        </div>
        <button onClick={downloadCsv} className="btn-outline">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="card text-sm text-gray-400">Loading…</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-400">
                <th className="py-2 pr-4 text-xs font-medium uppercase tracking-wider">Name</th>
                <th className="py-2 pr-4 text-xs font-medium uppercase tracking-wider">Email</th>
                <th className="py-2 pr-4 text-xs font-medium uppercase tracking-wider">Role</th>
                <th className="py-2 pr-4 text-xs font-medium uppercase tracking-wider">Active</th>
                <th className="py-2 pr-4 text-xs font-medium uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2.5 pr-4 font-medium text-navy">{u.full_name}</td>
                  <td className="py-2.5 pr-4">{u.email}</td>
                  <td className="py-2.5 pr-4">{u.role}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`badge ${u.is_active ? "badge-ready" : "badge-rejected"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
