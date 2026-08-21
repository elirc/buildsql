## Hint 1
The `VALUES` list has two rows, each a (label, extracted value) pair.
The alias names both output columns: `AS v(attr, value)`.

## Hint 2
`CROSS JOIN LATERAL (VALUES ('color', p.attributes ->> 'color'), ('size', p.attributes ->> 'size')) AS v(attr, value)`
