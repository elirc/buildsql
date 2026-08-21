## Hint 1
The query is already a keyset query, and it is still slow — so the shape is
not the problem this time. Look at what the plan has to do: pin
`customer_id = 4242`, then walk *that customer's* rows in `ts` order and
stop after twenty. The feed index gives the second half and nothing at all
for the first, and an index that cannot serve the filter leaves the executor
reading the table.

## Hint 2
This is lesson 32's rule and lesson 35's rule in one line: the equality
column comes first, and inside the region it pins, the next column is
already in order. Get it backwards and the plan can still find the rows but
must sort them afterwards — which is why the gate forbids a `Sort` node as
well as a `Seq Scan`. Build one index in `ex4/indexes.sql`, then check with
`dojo plan 52_keyset_pagination ex4`.
