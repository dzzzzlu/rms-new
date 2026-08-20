"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download } from "lucide-react";

export default function ReportsPage() {
  const supabase = createClient();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("requests")
        .select("tracking_code, status, created_at, copies, documents(name, fee), profiles(full_name)")
        .order("created_at", { ascending: false });
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);

  function downloadCsv() {
    const header = ["Tracking Code", "Requestor", "Document", "Copies", "Status", "Date"];
    const lines = rows.map((r) => [
      r.tracking_code,
      r.profiles?.full_name,
      r.documents?.name,
      r.copies,
      r.status,
      new Date(r.created_at).toLocaleDateString(),
    ]);
    const csv = [header, ...lines].map((l) => l.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "requests-report.csv";
    a.click();
  }

  const totalRevenue = rows.reduce(
    (sum, r) => sum + (r.status === "Completed" ? (r.documents?.fee ?? 0) * r.copies : 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy">Reports</h2>
          <p className="text-sm text-gray-400">{rows.length} total requests · ₱{totalRevenue.toFixed(2)} completed revenue</p>
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
                <th className="py-2 pr-4 text-xs font-medium uppercase tracking-wider">Tracking</th>
                <th className="py-2 pr-4 text-xs font-medium uppercase tracking-wider">Requestor</th>
                <th className="py-2 pr-4 text-xs font-medium uppercase tracking-wider">Document</th>
                <th className="py-2 pr-4 text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="py-2 pr-4 text-xs font-medium uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2.5 pr-4 text-navy font-medium">{r.tracking_code}</td>
                  <td className="py-2.5 pr-4">{r.profiles?.full_name}</td>
                  <td className="py-2.5 pr-4">{r.documents?.name}</td>
                  <td className="py-2.5 pr-4">{r.status}</td>
                  <td className="py-2.5 pr-4 text-gray-400">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
