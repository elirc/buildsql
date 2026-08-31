## Hint 1

A pivot whose grouping key and whose filter both come out of the document:
group by the colour as text, and count the rows whose tag array holds one
particular label.

## Hint 2

`GROUP BY attributes->>'color'`, then `count(*) FILTER (WHERE
attributes->'tags' ? 'sale')` beside a plain `count(*)`.

## Hint 3

The ratio has to repeat both aggregates - output aliases are not visible in
the SELECT list that defines them - and the `100.0` is what keeps it out of
integer division.
