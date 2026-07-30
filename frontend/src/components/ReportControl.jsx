import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createReport,
  REPORT_TARGET,
} from "../services/moderationService";

/**
 * Compact report control for product / inquiry surfaces.
 */
function ReportControl({
  targetType = REPORT_TARGET.PRODUCT,
  targetId,
  className = "",
}) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!targetId) return null;

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className={[
          "text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline",
          className,
        ].join(" ")}
      >
        Sign in to report
      </Link>
    );
  }

  if (done) {
    return (
      <p className={["text-xs font-medium text-[#0F6B36]", className].join(" ")}>
        Report submitted. Thanks.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "text-xs font-semibold text-slate-500 hover:text-rose-700 hover:underline",
          className,
        ].join(" ")}
      >
        Report
      </button>
    );
  }

  return (
    <form
      className={["mt-2 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3", className].join(
        " "
      )}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await createReport({
            targetType,
            targetId,
            reason,
            reporterUid: user.uid,
          });
          setDone(true);
          setOpen(false);
        } catch (err) {
          setError(err?.message || "Could not submit report.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="block text-xs font-semibold text-slate-700">
        Why are you reporting this?
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          minLength={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          placeholder="Spam, wrong info, abuse…"
        />
      </label>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Sending…" : "Submit report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ReportControl;
