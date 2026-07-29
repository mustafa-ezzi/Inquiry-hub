import { memo } from "react";
import Container from "../components/Container";

function HeroSection({
  eyebrow,
  heading,
  headingHighlight,
  description,
  primaryAction,
  secondaryAction,
  searchLabel,
  searchValue,
  onSearchChange,
  highlightCards,
  statCards,
}) {
  return (
    <section className="py-5 md:py-7">
      <Container>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)] lg:gap-4">

          {/* ── Left: green hero panel ── */}
          <div className="flex flex-col gap-5 rounded-2xl bg-[#0F6B36] p-6 md:p-7">

            {/* Eyebrow */}
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7FD4A0]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d4f0e1]">
                {eyebrow}
              </span>
            </span>

            {/* Heading + description */}
            <div className="space-y-3">
              <h1 className="max-w-xl text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">
                {heading}{" "}
                {headingHighlight && (
                  <span className="text-[#7FD4A0]">{headingHighlight}</span>
                )}
              </h1>
              <p className="max-w-lg text-sm leading-7 text-white/70">
                {description}
              </p>
            </div>

            {/* Search bar */}
            <div className="flex overflow-hidden rounded-[14px] border-[1.5px] border-white/25 bg-white">
              <div className="flex shrink-0 items-center px-3.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-slate-400"
                >
                  <circle
                    cx="6.5"
                    cy="6.5"
                    r="4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M10.5 10.5L14 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder={searchLabel}
                value={searchValue}
                onChange={onSearchChange}
                className="flex-1 bg-transparent py-3 text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                className="min-h-[46px] bg-[#0F6B36] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0d5f30]"
              >
                Search
              </button>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                className="min-h-[42px] rounded-xl border-[1.5px] border-white/30 bg-white px-5 text-sm font-semibold text-[#0F6B36] transition-all hover:bg-[#f0faf5]"
              >
                {primaryAction}
              </button>
              <button
                type="button"
                className="min-h-[42px] rounded-xl border-[1.5px] border-white/25 bg-white/12 px-5 text-sm font-semibold text-white transition-all hover:bg-white/20"
              >
                {secondaryAction}
              </button>
            </div>
          </div>

          {/* ── Right: cards + stats ── */}
          <div className="flex flex-col gap-3">

            {/* Highlight cards */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                {highlightCards.map((card) => (
                  <article
                    key={card.id}
                    className="flex flex-col gap-2 rounded-[14px] border border-[#e9f5ee] bg-[#f7fdf9] p-3.5 transition-all duration-200 hover:border-[#0F6B36]/40 hover:shadow-sm"
                  >
                    {/* Icon container */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F6B36]">
                      {card.icon ? (
                        card.icon
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <circle cx="8" cy="8" r="6" fill="white" opacity="0.6" />
                        </svg>
                      )}
                    </div>
                    <h2 className="text-sm font-bold text-[#111827]">
                      {card.title}
                    </h2>
                    <p className="text-xs leading-[1.65] text-[#6b7280]">
                      {card.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {statCards.map((card) => (
                <article
                  key={card.id}
                  className="rounded-2xl border border-slate-200 bg-white p-3.5"
                >
                  <p className="text-xl font-bold text-[#0F6B36] sm:text-2xl">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-[#6b7280]">
                    {card.label}
                  </p>
                  {card.trend && (
                    <p className="mt-1.5 text-[10px] font-semibold text-[#0F6B36]">
                      {card.trend}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}

export default memo(HeroSection);