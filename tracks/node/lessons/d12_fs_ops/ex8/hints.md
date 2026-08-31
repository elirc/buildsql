## Hint 1

Walk the tree as in ex2, and for each file compute a key that depends only on
its contents. Group by that key in a `Map`, then keep the groups with more than
one member.

`node:crypto` gives you the key:

```ts
createHash("sha256").update(contents).digest("hex");
```

## Hint 2

Hash rather than comparing contents pairwise. Pairwise comparison is O(n squared)
reads for the same answer, and the hash is a fixed 64 characters whatever the
file size — so the map stays small even when the files do not.

Note that a `Map` keyed by the file contents themselves would technically work
for text and would hold every byte of every file in memory at once.

## Hint 3

Three orderings, and the gate checks all of them: members sorted within a group,
groups ordered by their first member, and single files excluded entirely — a
file with no twin is not a group of one.

Do the sorting at the end, on a copy, rather than trying to walk in order:
`readdir` makes no promises.

The remaining decisions are the interesting ones for a real deduplicator. A hash
collision is a false positive — vanishingly unlikely with SHA-256, and a serious
tool still compares the bytes before deleting anything. And reading whole files
into memory is fine for a photo library and not for a backup volume, where you
would hash a stream instead.
