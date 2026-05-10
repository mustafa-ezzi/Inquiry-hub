import { memo } from "react";
import Container from "./Container";
import SectionIntro from "./SectionIntro";

function SectionShell({
  title,
  description,
  children,
  toolbar,
  className = "",
}) {
  const sectionClasses = ["py-7 md:py-10", className].filter(Boolean).join(" ");

  return (
    <section className={sectionClasses}>
      <Container>
        {toolbar ? (
          <div className="mb-4 flex flex-col gap-4 md:mb-5 lg:flex-row lg:items-end lg:justify-between">
            {title || description ? (
              <div className="min-w-0 flex-1">
                <SectionIntro title={title} description={description} />
              </div>
            ) : null}
            <div className="shrink-0">{toolbar}</div>
          </div>
        ) : title || description ? (
          <SectionIntro title={title} description={description} />
        ) : null}
        {children}
      </Container>
    </section>
  );
}

export default memo(SectionShell);
