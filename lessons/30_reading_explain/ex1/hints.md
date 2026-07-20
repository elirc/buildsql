## Hint 1
Run the EXPLAIN in the lab and look at the line that mentions the table
name. The node type is the first words on that line, before "on orders".

## Hint 2
With no indexes beyond primary keys, a filter on `total` can only read
everything: `SELECT 'Seq Scan';`
