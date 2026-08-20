"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle } from "lucide-react";

export default function VerifyPaymentsPage() {
  const supabase = createClient();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previews, setPreviews] = useState<Record<number, string>>({});

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("payments")
      .select("id, gcash_reference, proof_image, amount, status, request_id, requests(tracking_code, profiles(full_name))")
      .eq("status", "Pending")
      .order("created_at", { ascending: false });
    setPayments(data ?? []);

    for (const p of data ?? []) {
      const { data: signed } = await supabase.storage
        .from("payment-proofs")
        .createSignedUrl(p.proof_image, 60 * 10);
      if (signed?.signedUrl) {
        setPreviews((prev) => ({ ...prev, [p.id]: signed.signedUrl }));
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(payment: any, approve: boolean, reason?: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("payments")
      .update({
        status: approve ? "Verified" : "Rejected",
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
        rejection_reason: reason ?? null,
      })
      .eq("id", payment.id);

    await supabase
      .from("requests")
      .update({ status: approve ? "Processing" : "Rejected" })
      .eq("id", payment.request_id);

    load();
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-heading text-xl font-bold text-navy">Verify Payments</h2>
        <p className="text-sm text-gray-400">Review GCash proof and approve or reject each payment.</p>
      </div>

      {loading ? (
        <div className="card text-sm text-gray-400">Loading…</div>
      ) : payments.length === 0 ? (
        <div className="card text-sm text-gray-400">No pending payments.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {payments.map((p) => (
            <div key={p.id} className="card space-y-3">
              <div>
                <p className="font-semibold text-navy">{p.requests?.profiles?.full_name}</p>
                <p className="text-xs text-gray-400">{p.requests?.tracking_code}</p>
              </div>
              {previews[p.id] && (
                <img src={previews[p.id]} alt="Payment proof" className="w-full rounded-lg border border-gray-200" />
              )}
              <p className="text-sm text-gray-500">
                Ref: <span className="font-medium">{p.gcash_reference}</span> · ₱{p.amount}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => decide(p, true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#081833]"
                >
                  <CheckCircle size={15} /> Approve
                </button>
                <button
                  onClick={() => decide(p, false, "Payment could not be verified")}
                  className="btn-outline flex-1"
                >
                  <XCircle size={15} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
