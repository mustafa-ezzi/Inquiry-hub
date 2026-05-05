import { memo } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

function ProductGrid({ items  = [], onInquiry }) {
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-3.5 md:grid-cols-4 md:gap-4">
      {items?.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          onClick={() => handleProductClick(product)}
          onInquiry={() => onInquiry(product)}
        />
      ))}
    </div>
  );
}

export default memo(ProductGrid);