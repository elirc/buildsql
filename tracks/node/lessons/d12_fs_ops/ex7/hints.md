## Hint 1

Do not try to do this in one walk. Build **two indexes** first — a map from
relative path to size, one per side — and then the whole problem becomes set
arithmetic over two maps:

- in src, not in dest → copy
- in both, sizes differ → overwrite
- in dest, not in src → delete

Indexing both sides before writing anything also means you are comparing against
a consistent picture rather than against a directory your own loop is halfway
through changing.

## Hint 2

Reuse the walk from ex2 or ex4, but have it collect into a `Map` instead of
copying. One detail it needs that the others did not: a destination that does
not exist yet should index as **empty**, not throw — so catch `ENOENT` from
`readdir` and return.

Creating parent directories is only needed on the copy path, and only for files
that are new.

## Hint 3

Comparing by size is a deliberate simplification, and you should be ready to say
what it costs: a file edited without changing its length looks identical, and a
real sync tool therefore compares modification time as well, or a content hash
when it can afford one. Size alone is fast, deterministic, and wrong in exactly
one interesting way.

Two decisions left. This version does not remove directories that become empty
in the destination — you have ex4 for that if you want it. And it says nothing
about what happens when a path is a file on one side and a directory on the
other, which is the case a production sync spends most of its code on.
