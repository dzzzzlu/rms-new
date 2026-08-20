"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Save } from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        student_number: profile.student_number,
        course: profile.course,
        contact_number: profile.contact_number,
      })
      .eq("id", profile.id);
    setSaving(false);
    setSaved(true);
    setEditing(false);
  }

  if (!profile) return <div className="card text-sm text-gray-400">Loading…</div>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Profile header card */}
      <div className="card flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy text-xl font-bold text-white">
          {profile.full_name?.charAt(0).toUpperCase() || "?"}
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-navy">{profile.full_name}</h2>
          <p className="text-sm text-gray-400">{profile.email}</p>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSave} className="card space-y-4">
        {saved && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Profile updated.
          </div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-navy">Personal Information</h3>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-full border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy transition hover:bg-navy/5"
            >
              <Pencil size={13} /> Edit
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="btn-primary !px-3 !py-1.5 !text-xs"
            >
              <Save size={13} /> {saving ? "Saving…" : "Save"}
            </button>
          )}
        </div>

        <div>
          <label className="label">Full Name</label>
          <input
            className="input"
            value={profile.full_name ?? ""}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            disabled={!editing}
          />
        </div>
        <div>
          <label className="label">Student Number</label>
          <input
            className="input"
            value={profile.student_number ?? ""}
            onChange={(e) => setProfile({ ...profile, student_number: e.target.value })}
            disabled={!editing}
          />
        </div>
        <div>
          <label className="label">Course</label>
          <input
            className="input"
            value={profile.course ?? ""}
            onChange={(e) => setProfile({ ...profile, course: e.target.value })}
            disabled={!editing}
          />
        </div>
        <div>
          <label className="label">Contact Number</label>
          <input
            className="input"
            value={profile.contact_number ?? ""}
            onChange={(e) => setProfile({ ...profile, contact_number: e.target.value })}
            disabled={!editing}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input bg-gray-50" value={profile.email ?? ""} disabled />
        </div>
      </form>
    </div>
  );
}
