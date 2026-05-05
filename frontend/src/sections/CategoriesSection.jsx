import { memo } from "react";
import CategoryCard from "../components/CategoryCard";
import SectionShell from "../components/SectionShell";

function CategoriesSection({ title, description, items }) {
  return (
    <SectionShell
      title={title}
      description={description}
      className="hidden lg:hidden"
    >
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:px-0 lg:grid-cols-4">
        {items.map((category) => (
          <div
            key={category.id}
            className="min-w-[220px] snap-start md:min-w-0"
          >
            <CategoryCard {...category} />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export default memo(CategoriesSection);
