"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";

const ROLES = ["student", "registrar", "admin"] as const;

export default function ManageUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setRole(id: string, role: string) {
    await supabase.from("profiles").update({ role }).eq("id", id);
    load();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await supabase.from("profiles").update({ is_active: !isActive }).eq("id", id);
    load();
  }

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(q.toLowerCase()) ||
      u.email?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy">Manage Users</h2>
          <p className="text-sm text-gray-400">{users.length} total accounts</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="input !w-auto !pl-9"
            placeholder="Search name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="card text-sm text-gray-400">Loading…</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <div key={u.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                  {u.full_name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-semibold text-navy">{u.full_name}</p>
                  <p className="text-xs text-gray-400">
                    {u.email} {u.student_number ? `· ${u.student_number}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="input w-auto"
                  value={u.role}
                  onChange={(e) => setRole(u.id, e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => toggleActive(u.id, u.is_active)}
                  className={u.is_active ? "btn-outline" : "btn-primary"}
                >
                  {u.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
