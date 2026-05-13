import { memo, useCallback, useRef, useState } from "react";

function InquiryComposer({ onSend, disabled, sending }) {
  const [text, setText] = useState("");
  const taRef = useRef(null);

  const submit = useCallback(() => {
    const t = text.trim();
    if (!t || sending || disabled) return;
    onSend(t);
    setText("");
    taRef.current?.focus();
  }, [text, sending, disabled, onSend]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key !== "Enter") return;
      if (e.shiftKey) return;
      e.preventDefault();
      submit();
    },
    [submit]
  );

  const empty = !text.trim();

  return (
    <div className="border-t border-slate-200 bg-white px-3 py-3 md:px-5">
      <div className="mx-auto flex max-w-2xl items-end gap-2">
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Message… (Enter to send, Shift+Enter for new line)"
          disabled={disabled || sending}
          className="max-h-36 min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm outline-none ring-[#0F6B36]/20 focus:border-[#0F6B36]/35 focus:bg-white focus:ring-2 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={submit}
          disabled={empty || sending || disabled}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F6B36] text-white shadow-sm transition-colors hover:bg-[#0d5f30] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send"
        >
          {sending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 9L16 2L10 16L8 9L2 9Z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default memo(InquiryComposer);
