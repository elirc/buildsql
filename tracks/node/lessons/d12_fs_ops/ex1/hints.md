## Hint 1

Three calls: `mkdir` with `{ recursive: true }` on the parent, `writeFile` to a
temporary name, `rename` onto the target.

`rename` is the whole point. On a single filesystem it is atomic: at every
instant the target is either entirely the old file or entirely the new one.
`writeFile` straight onto the target is not — a reader arriving mid-write gets
whatever has been flushed so far, which is how a config file ends up truncated
after a crash.

## Hint 2

Two properties the temporary name must have, and the gate checks both.

**Same directory as the target.** A temp file in the OS temp dir usually sits on
a different filesystem, and `rename` across filesystems is not a rename at all —
Node falls back to copy-then-delete, and the atomicity is gone.

**Unique per call.** With a fixed name like `file.tmp`, two concurrent writers
share one temporary file: the first rename succeeds and the second fails with
`ENOENT` on a file the other writer already moved. `randomUUID()` or a counter
solves it.

## Hint 3

Clean up on the failure path. If `writeFile` fails halfway, the temporary is
still there — and a directory that slowly fills with `.q1.txt.<uuid>.tmp` files
is exactly what this pattern is famous for when nobody wrote the `catch`.

The remaining decision is durability. This version is atomic but not durable: a
power cut immediately after the rename can still lose the data, because neither
the file nor the directory entry has been `fsync`ed. Know that the grown-up
version opens the file handle, calls `sync()`, and syncs the directory too — and
know why most code does not bother.
