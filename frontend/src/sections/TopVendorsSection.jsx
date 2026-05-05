import { memo } from "react";
import SectionShell from "../components/SectionShell";
import VendorCard from "../components/VendorCard";

function TopVendorsSection({ title, description, items }) {
  return (
    <SectionShell title={title} description={description}>
      <div className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {items.map((vendor) => (
          <VendorCard key={vendor.id} {...vendor} />
        ))}
      </div>
    </SectionShell>
  );
}

export default memo(TopVendorsSection); 