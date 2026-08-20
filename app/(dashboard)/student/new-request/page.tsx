"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileCheck, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Doc = { id: number; name: string; description: string | null; fee: number; processing_days: number };

function trackingCode() {
  return "RM-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 900 + 100);
}

export default function NewRequestPage() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [documentId, setDocumentId] = useState<number | "">("");
  const [purpose, setPurpose] = useState("");
  const [copies, setCopies] = useState(1);
  const [gcashRef, setGcashRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("documents")
      .select("*")
      .eq("is_active", true)
      .then(({ data }) => setDocs(data ?? []));
  }, []);

  const selectedDoc = docs.find((d) => d.id === documentId);
  const amount = selectedDoc ? selectedDoc.fee * copies : 0;

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setProofFile(file);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setProofFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!documentId) return setError("Please choose a document type.");
    if (!proofFile) return setError("Please attach your GCash payment proof.");

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setError("Not signed in.");

    const { data: request, error: reqErr } = await supabase
      .from("requests")
      .insert({
        tracking_code: trackingCode(),
        user_id: user.id,
        document_id: documentId,
        purpose,
        copies,
        status: "Pending",
      })
      .select()
      .single();

    if (reqErr || !request) {
      setLoading(false);
      return setError(reqErr?.message ?? "Could not create request.");
    }

    const path = `${user.id}/${request.id}-${proofFile.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("payment-proofs")
      .upload(path, proofFile);

    if (uploadErr) {
      setLoading(false);
      return setError(uploadErr.message);
    }

    const { error: payErr } = await supabase.from("payments").insert({
      request_id: request.id,
      gcash_reference: gcashRef,
      proof_image: path,
      amount,
      status: "Pending",
    });

    if (payErr) {
      setLoading(false);
      return setError(payErr.message);
    }

    await supabase
      .from("requests")
      .update({ status: "Payment Verification" })
      .eq("id", request.id);

    router.push("/student/history");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Request Details */}
        <div className="card">
          <h2 className="mb-1 font-heading text-lg font-semibold text-navy">Request Details</h2>
          <p className="mb-5 text-sm text-gray-400">What document are you requesting?</p>

          <div className="space-y-4">
            <div>
              <label className="label">Document Type</label>
              <select
                className="input"
                value={documentId}
                onChange={(e) => setDocumentId(Number(e.target.value))}
              >
                <option value="">Select a document…</option>
                {docs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — ₱{d.fee.toFixed(2)} ({d.processing_days} days)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Purpose</label>
              <input className="input" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Employment, Transfer, etc." />
            </div>

            <div>
              <label className="label">Number of Copies</label>
              <input
                type="number"
                min={1}
                className="input"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
              />
            </div>

            {selectedDoc && (
              <div className="rounded-lg bg-navy/5 px-4 py-3 text-sm text-navy">
                Total amount to pay via GCash: <span className="font-bold">₱{amount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Payment */}
        <div className="card">
          <h2 className="mb-1 font-heading text-lg font-semibold text-navy">Payment</h2>
          <p className="mb-5 text-sm text-gray-400">Upload your GCash payment confirmation.</p>

          <div className="space-y-4">
            <div>
              <label className="label">GCash Reference Number</label>
              <input className="input" value={gcashRef} onChange={(e) => setGcashRef(e.target.value)} required placeholder="e.g. 1234567890123" />
            </div>

            <div>
              <label className="label">Payment Proof (screenshot)</label>
              {/* Drag and drop area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition ${
                  dragOver
                    ? "border-navy bg-navy/5"
                    : proofFile
                    ? "border-emerald-300 bg-emerald-50/50"
                    : "border-gray-300 bg-gray-50 hover:border-navy/40 hover:bg-navy/5"
                }`}
              >
                {proofFile ? (
                  <>
                    <FileCheck className="mb-2 text-emerald-600" size={28} />
                    <p className="text-sm font-medium text-gray-700">{proofFile.name}</p>
                    <p className="text-xs text-gray-400">{(proofFile.size / 1024).toFixed(1)} KB</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setProofFile(null); }}
                      className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                    >
                      <X size={12} /> Remove
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="mb-2 text-gray-400" size={28} />
                    <p className="text-sm font-medium text-gray-500">Drag and drop your screenshot here</p>
                    <p className="text-xs text-gray-400">or click to browse</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Submitting…" : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
