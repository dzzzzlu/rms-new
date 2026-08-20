"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin?: () => void }) {
  const supabase = createClient();
  const [form, setForm] = useState({
    full_name: "",
    student_number: "",
    course: "",
    contact_number: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          full_name: form.full_name,
          student_number: form.student_number,
          course: form.course,
          contact_number: form.contact_number,
          role: "student",
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy/5 text-navy">
          <Mail size={26} />
        </div>
        <h2 className="font-heading text-lg font-bold text-navy">Check your email</h2>
        <p className="mt-2 text-sm text-gray-400">
          We sent a verification link to <span className="font-medium text-gray-600">{form.email}</span>. Click it to
          activate your account, then sign in.
        </p>
        {onSwitchToLogin ? (
          <button onClick={onSwitchToLogin} className="btn-primary mt-6 inline-flex">
            Go to Sign In
          </button>
        ) : (
          <Link href="/login" className="btn-primary mt-6 inline-flex">
            Go to Sign In
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-7 shadow-2xl">
      <h2 className="mb-5 font-heading text-lg font-semibold text-navy">
        Create your Student / Alumni account
      </h2>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Full Name</label>
          <input required className="input" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
        </div>
        <div>
          <label className="label">Student Number</label>
          <input className="input" value={form.student_number} onChange={(e) => update("student_number", e.target.value)} />
        </div>
        <div>
          <label className="label">Course</label>
          <input className="input" value={form.course} onChange={(e) => update("course", e.target.value)} />
        </div>
        <div>
          <label className="label">Contact Number</label>
          <input className="input" value={form.contact_number} onChange={(e) => update("contact_number", e.target.value)} />
        </div>
      </div>

      <div className="mb-4">
        <label className="label">Email</label>
        <input type="email" required className="input" value={form.email} onChange={(e) => update("email", e.target.value)} />
      </div>

      <div className="mb-6">
        <label className="label">Password</label>
        <input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => update("password", e.target.value)} />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Creating account…" : "Create Account"}
      </button>

      <p className="mt-5 text-center text-sm text-gray-400">
        Already have an account?{" "}
        {onSwitchToLogin ? (
          <button type="button" onClick={onSwitchToLogin} className="font-semibold text-navy hover:underline">
            Sign in
          </button>
        ) : (
          <Link href="/login" className="font-semibold text-navy hover:underline">
            Sign in
          </Link>
        )}
      </p>
    </form>
  );
}
