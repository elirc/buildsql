// d10_effects_basics / ex7 - resetting a choice when the thing it belonged to changes.
// See tracks/react/lessons/d10_effects_basics/README.md, "Exercise 7".
import { useEffect, useState } from "react";

type Product = { id: string; sizes: string[] };

export function ProductPicker({
  product,
  onRender,
}: {
  product: Product;
  onRender: (id: string, size: string) => void;
}) {
  const [size, setSize] = useState(product.sizes[0]);

  useEffect(() => {
    setSize(product.sizes[0]);
  }, [product]);

  onRender(product.id, size);

  return (
    <>
      {product.sizes.map((option) => (
        <button key={option} type="button" onClick={() => setSize(option)}>
          {option}
        </button>
      ))}
      <p role="status">
        {product.id}: {size}
      </p>
    </>
  );
}
