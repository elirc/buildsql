// d10_effects_basics / ex7 - reference solution.
import { useState } from "react";

type Product = { id: string; sizes: string[] };

export function ProductPicker({
  product,
  onRender,
}: {
  product: Product;
  onRender: (id: string, size: string) => void;
}) {
  const [choice, setChoice] = useState<{ id: string; size: string } | null>(null);
  const size = choice && choice.id === product.id ? choice.size : product.sizes[0];

  onRender(product.id, size);

  return (
    <>
      {product.sizes.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setChoice({ id: product.id, size: option })}
        >
          {option}
        </button>
      ))}
      <p role="status">
        {product.id}: {size}
      </p>
    </>
  );
}
