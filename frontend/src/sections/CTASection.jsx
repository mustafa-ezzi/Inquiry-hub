import { memo } from "react";
import { Link } from "react-router-dom";
import SectionShell from "../components/SectionShell";

function CTASection({ title, description, actionLabel, to = "/vendor-waitlist" }) {
  return (
    <SectionShell>
      <div className="rounded-2xl border border-slate-200 bg-secondary px-5 py-8 text-center shadow-sm md:px-7 md:py-9">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
          <h2 className="text-2xl font-semibold text-black md:text-3xl">
            {title}
          </h2>
          <p className="text-sm leading-6 text-white-800 md:text-base">
            {description}
          </p>
          <Link
            to={to}
            className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-secondary shadow-sm transition-all duration-200 hover:bg-background hover:shadow-md"
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </SectionShell>
  );
}

export default memo(CTASection);
