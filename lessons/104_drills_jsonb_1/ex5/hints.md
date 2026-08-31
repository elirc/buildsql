## Hint 1

A document becomes rows through a set-returning function, and set-returning
functions belong in `FROM`. Each product should produce one row per
remaining key.

## Hint 2

`CROSS JOIN LATERAL jsonb_each_text(p.attributes) AS kv(key, value)`
expands the object. Either drop the `tags` key from the document first with
the `-` operator, or filter `kv.key <> 'tags'` afterwards.
