import { memo } from "react";
import InfoCard from "../components/InfoCard";
import SectionShell from "../components/SectionShell";

function HowItWorks({ title, description, items }) {
  return (
    <SectionShell title={title} description={description}>
      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
        {items.map((item) => (
          <InfoCard
            key={item.id}
            title={item.title}
            description={item.description}
            eyebrow={item.eyebrow}
            icon={item.icon}
          />
        ))}
      </div>
    </SectionShell>
  );
}

export default memo(HowItWorks);
