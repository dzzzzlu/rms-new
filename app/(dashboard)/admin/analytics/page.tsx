"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, X } from "lucide-react";

type Row = {
  status: string;
  created_at: string;
  copies: number;
  documents: { name: string; fee: number } | null;
  profiles: { full_name: string; course: string | null } | null;
};

const CATEGORIES = [
  { value: "all", label: "All fields" },
  { value: "status", label: "Status" },
  { value: "document", label: "Document type" },
  { value: "requestor", label: "Requestor name" },
  { value: "course", label: "Course" },
] as const;

export default function AnalyticsPage() {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["value"]>("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("requests")
        .select("status, created_at, copies, documents(name, fee), profiles(full_name, course)");
      setRows((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const fields: Record<string, string> = {
        status: r.status ?? "",
        document: r.documents?.name ?? "",
        requestor: r.profiles?.full_name ?? "",
        course: r.profiles?.course ?? "",
      };
      if (category === "all") {
        return Object.values(fields).some((v) => v.toLowerCase().includes(q));
      }
      return (fields[category] ?? "").toLowerCase().includes(q);
    });
  }, [rows, query, category]);

  const byStatus: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  const byDocument: Record<string, number> = {};
  for (const r of filtered) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    const month = new Date(r.created_at).toLocaleString("default", { month: "short", year: "2-digit" });
    byMonth[month] = (byMonth[month] ?? 0) + 1;
    const doc = r.documents?.name ?? "Unknown";
    byDocument[doc] = (byDocument[doc] ?? 0) + 1;
  }

  const maxStatus = Math.max(1, ...Object.values(byStatus));
  const maxMonth = Math.max(1, ...Object.values(byMonth));
  const maxDoc = Math.max(1, ...Object.values(byDocument));

  function Bar({ data, max, color }: { data: Record<string, number>; max: number; color: string }) {
    return (
      <div className="space-y-2.5">
        {Object.entries(data).map(([label, count]) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <span className="w-32 shrink-0 truncate text-gray-500">{label}</span>
            <div className="h-3 flex-1 rounded-full bg-gray-100">
              <div
                className={`h-3 rounded-full ${color}`}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="w-6 text-right font-semibold text-navy">{count}</span>
          </div>
        ))}
        {Object.keys(data).length === 0 && (
          <p className="text-sm text-gray-400">No matching results.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-heading text-xl font-bold text-navy">Analytics</h2>
        <p className="text-sm text-gray-400">Request volume and demand trends.</p>
      </div>

      <div className="card flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="input !pl-9"
            placeholder="Search status, document, requestor, or course…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="input w-auto"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {query && (
          <button onClick={() => setQuery("")} className="btn-outline !px-3">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="card text-sm text-gray-400">Loading…</div>
      ) : (
        <>
          <p className="text-sm text-gray-400">
            Showing {filtered.length} of {rows.length} requests
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card">
              <h3 className="mb-4 font-heading font-semibold text-navy">By Status</h3>
              <Bar data={byStatus} max={maxStatus} color="bg-navy" />
            </div>
            <div className="card">
              <h3 className="mb-4 font-heading font-semibold text-navy">By Month</h3>
              <Bar data={byMonth} max={maxMonth} color="bg-gold" />
            </div>
            <div className="card lg:col-span-2">
              <h3 className="mb-4 font-heading font-semibold text-navy">By Document Type</h3>
              <Bar data={byDocument} max={maxDoc} color="bg-navy/60" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
