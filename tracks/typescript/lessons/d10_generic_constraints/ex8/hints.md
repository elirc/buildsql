## Hint 1

The constraint has to name every member the class reads, so add the version:
`T extends { id: string; version: number }`.

Then `put` needs one comparison and two outcomes, and neither of them may modify
what is stored when the write is refused.

## Hint 2

A `Map<string, T>` keyed by id is the store. Refuse when there is already an
entry whose version is **greater than or equal to** the incoming one - the gate
writes the same version twice, so `>` alone is not enough.

Sort in `all()` rather than keeping the map ordered: reads are where the order
is wanted.

Left to you: whether `all()` should hand back the stored objects or copies. The
gate does not care - a caller who mutates one of them will.
