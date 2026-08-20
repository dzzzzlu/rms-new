"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ onSwitchToRegister }: { onSwitchToRegister?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const justVerified = searchParams.get("verified") === "1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message.toLowerCase().includes("email not confirmed")
          ? "Please verify your email before signing in — check your inbox for the confirmation link."
          : error.message
      );
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const home =
      profile?.role === "admin"
        ? "/admin/dashboard"
        : profile?.role === "registrar"
        ? "/registrar/dashboard"
        : "/student/dashboard";

    router.push(home);
    router.refresh();
  }

  async function resendVerification() {
    if (!email) return setError("Enter your email above first.");
    await supabase.auth.resend({ type: "signup", email });
    setResent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-7 shadow-2xl">
      <h2 className="mb-5 font-heading text-lg font-semibold text-navy">Sign in</h2>

      {justVerified && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Email verified — you can sign in now.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
          {error.includes("verify your email") && (
            <button type="button" onClick={resendVerification} className="ml-1 font-semibold underline">
              Resend verification email
            </button>
          )}
        </div>
      )}

      {resent && (
        <div className="mb-4 rounded-lg bg-navy/5 px-3 py-2 text-sm text-navy">
          Verification email resent — check your inbox.
        </div>
      )}

      <div className="mb-4">
        <label className="label">Email</label>
        <input
          type="email"
          required
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@regismarie.edu.ph"
        />
      </div>

      <div className="mb-6">
        <label className="label">Password</label>
        <input
          type="password"
          required
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Signing in…" : "Sign In"}
      </button>

      <p className="mt-5 text-center text-sm text-gray-400">
        No account yet?{" "}
        {onSwitchToRegister ? (
          <button type="button" onClick={onSwitchToRegister} className="font-semibold text-navy hover:underline">
            Register
          </button>
        ) : (
          <Link href="/register" className="font-semibold text-navy hover:underline">
            Register
          </Link>
        )}
      </p>
    </form>
  );
}
