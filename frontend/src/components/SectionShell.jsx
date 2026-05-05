import { memo } from "react";
import Container from "./Container";
import SectionIntro from "./SectionIntro";

function SectionShell({ title, description, children, className = "" }) {
  const sectionClasses = ["py-7 md:py-10", className].filter(Boolean).join(" ");

  return (
    <section className={sectionClasses}>
      <Container>
        {title || description ? (
          <SectionIntro title={title} description={description} />
        ) : null}
        {children}
      </Container>
    </section>
  );
}

export default memo(SectionShell);
