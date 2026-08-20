import { createClient, getProfile } from "@/lib/supabase/server";

const STATUS_STEPS = ["Pending", "Payment Verification", "Processing", "Ready for Pickup"];

function ProgressTracker({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);
  const isRejected = currentStatus === "Rejected";
  const isCompleted = currentStatus === "Completed";
  const activeIndex = isCompleted ? STATUS_STEPS.length - 1 : isRejected ? -1 : currentIndex;

  return (
    <div className="flex w-full items-center gap-0">
      {STATUS_STEPS.map((step, i) => {
        const isActive = i <= activeIndex && activeIndex >= 0;
        const isCurrent = i === activeIndex;
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full border-2 transition ${
                  isActive
                    ? "border-navy bg-navy"
                    : isRejected
                    ? "border-red-300 bg-red-100"
                    : "border-gray-300 bg-white"
                } ${isCurrent ? "ring-2 ring-navy/20" : ""}`}
              />
              <span className={`mt-1.5 text-[10px] font-medium leading-tight text-center ${
                isActive ? "text-navy" : "text-gray-400"
              }`}>
                {step === "Payment Verification" ? "Payment" : step === "Ready for Pickup" ? "Ready" : step}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`progress-line mx-1 mb-5 ${
                  i < activeIndex ? "bg-navy" : isRejected ? "bg-red-200" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  Pending: "badge-pending",
  "Payment Verification": "badge-verification",
  Processing: "badge-processing",
  "Ready for Pickup": "badge-ready",
  Completed: "badge-completed",
  Rejected: "badge-rejected",
};

export default async function HistoryPage() {
  const profile = await getProfile();
  const supabase = createClient();

  const { data: requests } = await supabase
    .from("requests")
    .select("id, tracking_code, purpose, copies, status, created_at, documents(name, fee)")
    .eq("user_id", profile!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-heading text-xl font-bold text-navy">My Request History</h2>
        <p className="text-sm text-gray-400">Track the status of every document request you've submitted.</p>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="card text-sm text-gray-400">No requests yet.</div>
      ) : (
        <div className="space-y-3">
          {requests.map((r: any) => (
            <div key={r.id} className="card space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy">{r.documents?.name}</p>
                  <p className="text-xs text-gray-400">
                    {r.tracking_code} · {r.copies} cop{r.copies > 1 ? "ies" : "y"} ·{" "}
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  {r.purpose && <p className="mt-1 text-sm text-gray-500">Purpose: {r.purpose}</p>}
                </div>
                <span className={`badge ${STATUS_COLOR[r.status] ?? "badge-pending"}`}>
                  {r.status}
                </span>
              </div>
              {/* Progress tracker */}
              <ProgressTracker currentStatus={r.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
