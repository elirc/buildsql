## Hint 1

Country contains year - a hierarchy - so ROLLUP is the right shorthand: detail rows, one subtotal per country, one grand total. CUBE would add per-year subtotals nobody asked for.

## Hint 2

GROUP BY ROLLUP (country, extract(year FROM created_at)::int), with the same expression in the SELECT list. Both sort keys ascending places every NULL subtotal row after the detail rows it summarises.
