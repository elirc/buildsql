// 11_performance_patterns / challenge - the capstone component.
// See tracks/react/lessons/11_performance_patterns/README.md, "Challenge".
import { useState } from "react";

export type Product = { id: string; name: string };

function Row({
  product,
  onRowRender,
}: {
  product: Product;
  onRowRender: (id: string) => void;
}) {
  onRowRender(product.id);
  return <li>{product.name}</li>;
}

export function ProductTable({
  products,
  onRowRender,
}: {
  products: Product[];
  onRowRender: (id: string) => void;
}) {
  const [filter, setFilter] = useState("");

  const visible = [...products]
    .filter((product) => product.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <label htmlFor="filter">Filter</label>
      <input id="filter" value={filter} onChange={(event) => setFilter(event.target.value)} />

      <ul>
        {visible.map((product) => (
          <Row key={product.id} product={product} onRowRender={onRowRender} />
        ))}
      </ul>

      <p role="status">
        {visible.length} of {products.length} shown
      </p>
    </>
  );
}
