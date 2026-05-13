import { memo, useEffect, useMemo, useRef } from "react";

function formatDay(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InquiryMessageThread({ messages }) {
  const bottomRef = useRef(null);

  const grouped = useMemo(() => {
    const sorted = [...messages].sort((a, b) => a.createdAt - b.createdAt);
    const out = [];
    let lastDay = "";
    for (const m of sorted) {
      const day = formatDay(m.createdAt);
      if (day !== lastDay) {
        lastDay = day;
        out.push({ type: "divider", id: `d-${day}-${m.id}`, label: day });
      }
      out.push({ type: "msg", ...m });
    }
    return out;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-5">
      <div className="mx-auto max-w-2xl space-y-4 pb-4">
        {grouped.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#6b7280]">
            No messages yet.
          </p>
        ) : null}
        {grouped.map((item) =>
          item.type === "divider" ? (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2"
              role="separator"
            >
              <div className="h-px flex-1 bg-slate-200" />
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {item.label}
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          ) : (
            <div
              key={item.id}
              className={[
                "flex w-full",
                item.role === "buyer" ? "justify-end" : "justify-start",
              ].join(" ")}
            >
              <div
                className={[
                  "max-w-[min(100%,85%)] rounded-2xl px-3.5 py-2.5 shadow-sm",
                  item.role === "buyer"
                    ? "rounded-br-md bg-[#0F6B36] text-white"
                    : "rounded-bl-md border border-slate-200 bg-white text-[#111827]",
                ].join(" ")}
              >
                <p
                  className={[
                    "text-[10px] font-semibold uppercase tracking-wide",
                    item.role === "buyer" ? "text-white/80" : "text-slate-500",
                  ].join(" ")}
                >
                  {item.senderName}
                  {item.senderRole ? ` · ${item.senderRole}` : ""}
                </p>
                <p
                  className={[
                    "mt-1 whitespace-pre-wrap text-sm leading-relaxed",
                    item.role === "buyer" ? "text-white" : "text-[#111827]",
                  ].join(" ")}
                >
                  {item.body}
                </p>
                <p
                  className={[
                    "mt-1.5 text-[10px]",
                    item.role === "buyer" ? "text-white/70" : "text-slate-400",
                  ].join(" ")}
                >
                  {formatTime(item.createdAt)}
                </p>
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} aria-hidden className="h-1" />
      </div>
    </div>
  );
}

export default memo(InquiryMessageThread);
