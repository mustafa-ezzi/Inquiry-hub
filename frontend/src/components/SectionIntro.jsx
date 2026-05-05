import { memo } from "react";

function SectionIntro({ title, description }) {
  return (
    <div className="mb-4 flex flex-col gap-1.5 md:mb-5">
      <h2 className="text-xl font-semibold text-[#111827] md:text-2xl">
        {title}
      </h2>
      <p className="text-sm leading-6 text-[#6b7280] md:text-base">
        {description}
      </p>
    </div>
  );
}

export default memo(SectionIntro);
