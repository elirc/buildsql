# Reading - node/d12_fs_ops

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **filesystem work that survives being interrupted**.
A disk is shared, slow and mutable: another process can read your file halfway
through the write (ex1), your own recursion can be looking at a directory whose
contents you are changing (ex4, ex7), and any of it can throw at any point,
which is where the temporary files and orphaned directories come from (ex1,
ex6). Three habits run through all eight answers. Walk trees with `readdir(dir,
{ withFileTypes: true })` and carry the **relative** path as a forward-slash
string, converting to a real path only at the syscall — that is what makes the
returned values portable by construction. Sort at the end, because `readdir`
promises no order. And treat `ENOENT` as the one error that means "nothing is
there yet", rethrowing everything else, because a permissions failure reported
as an empty result is how real damage goes unnoticed.

## ex1 — rename is the atomic operation

**What it tested:** that "write a file safely" means write elsewhere and rename,
and that both properties of "elsewhere" matter.

**The classic mistake:** a fixed temporary name like `config.json.tmp`. Two
concurrent writers share it: the first rename succeeds, the second fails with
`ENOENT` on a file that has already been moved. The other mistake is putting the
temporary in `os.tmpdir()`, which is usually a different filesystem — `rename`
across filesystems is not a rename, Node falls back to copy-then-delete, and the
atomicity you were buying is gone.

**Model answer:** `mkdir` the parent, a unique temporary name in the *same*
directory, `writeFile`, `rename`, and a `catch` that removes the temporary
before rethrowing.

## ex2 — pruning is not filtering

**What it tested:** a recursive copy with an exclusion predicate, and the
distinction between skipping a directory's *contents* and skipping the directory
itself.

**The classic mistake:** creating the destination directory and then filtering
its children, which leaves an empty `node_modules/` in the output. Second, and
more portable-looking than it is: building native paths during the walk and
converting to forward slashes at the end. Do it the other way round — carry the
portable form and convert at the syscall — and there is nothing left to forget.

**Model answer:** `readdir` with `withFileTypes`, a relative forward-slash string
threaded through the recursion, `continue` before the `mkdir` when `skip` says
so, and one `sort()` at the end.

## ex3 — the recursion returns the answer

**What it tested:** the simplest possible tree fold, and two things that are not
files.

**The classic mistake:** counting directories, whose `size` from `stat` is a
real number and means nothing anybody wants. Or using `else` rather than
`else if (entry.isFile())`, which sweeps sockets, FIFOs and symlinks into the
file count.

**Model answer:** return `{ files, bytes }` from the recursive call and add the
totals up — no accumulator parameter, and the empty-directory case handled by
the loop simply not running.

## ex4 — bottom up, because emptiness propagates

**What it tested:** that this cannot be done top down in one pass. `outer/`
containing `inner/` is not empty when you first look at it; it becomes empty
only after `inner` is removed.

**The classic mistake:** checking emptiness before recursing, which finds
`outer` non-empty and moves on — so the caller has to run the function
repeatedly until it stops changing anything. The other one is `rm(dir, {
recursive: true })` instead of `rmdir`, which happily deletes a directory full
of files if your emptiness check was wrong.

**Model answer:** a helper that returns "am I empty *after* my children were
pruned", recursing first and removing from the parent's loop — which is also
what keeps the root itself safe.

## ex5 — one line, one record

**What it tested:** the JSONL format and two pieces of error hygiene.

**The classic mistake:** returning `[]` for any read failure. `ENOENT` means the
log has not been written yet; `EACCES` means somebody has a permissions problem
they will never find out about if you hide it behind an empty array. The second:
reporting the position of a `JSON.parse` failure by counting *records* rather
than *lines*, so one blank line puts every number after it out by one — and the
number is the only reason you added it.

**Model answer:** `appendFile` with a trailing newline, `ENOENT` caught by code
and nothing else, blank lines skipped by `trim()`, and the line number taken
from the index of the split array plus one.

## ex6 — finally, and the resource you did not own

**What it tested:** the scoped-resource pattern applied to a directory, and
`mkdtemp` — which creates and names in one step, so two callers cannot collide.

**The classic mistake:** cleaning up after the call rather than in a `finally`,
so the failure path — precisely the one with a half-written workspace on it —
leaks. The subtler one is `return run(dir)` instead of `return await run(dir)`:
the function returns the pending promise, `finally` runs at once, and the
directory is deleted while the work is still using it.

**Model answer:** `mkdtemp` under `os.tmpdir()`, `try { return await run(dir) }
finally { await rm(dir, { recursive: true, force: true }) }`, and no `catch`, so
the caller's failure passes through untouched.

## ex7 — index first, then act

**What it tested:** a three-way diff over two trees, and the discipline of not
mutating what you are still reading.

**The classic mistake:** walking the source and writing as you go, then walking
the destination to find extras — the second walk now sees the files the first
one just created, and every one of them looks like a match, which is correct by
luck rather than by design. Build both indexes first and the arithmetic is
obvious. The other mistake is letting `ENOENT` escape when the destination does
not exist yet, when what it means is "the destination is empty".

**Model answer:** two `Map`s from relative path to size, three loops over set
membership, and a note that comparing by size alone misses an edit that keeps
the length — which is why real tools also compare mtime or a hash.

## ex8 — hash, do not compare

**What it tested:** grouping by content, and choosing a representation that does
not scale with file size.

**The classic mistake:** comparing every pair of files, which is O(n squared)
reads for an answer a single pass can produce. Or using the file contents
themselves as the `Map` key, which holds every byte of every file in memory at
once. A digest is 64 characters regardless.

**Model answer:** one `sha256` per file into a `Map<string, string[]>`, filter
to groups of two or more, sort members and then groups — and the honest caveat
that a serious deduplicator compares the bytes before deleting anything, because
a hash match is evidence and not proof.

## Further reading

- [Node.js: File system promises API](https://nodejs.org/api/fs.html#promises-api) — everything used here, including `mkdtemp`, `rename` and `rm`.
- [Node.js: `fs.Dirent`](https://nodejs.org/api/fs.html#class-fsdirent) — what `withFileTypes: true` gives you, and why it beats a `stat` per entry.
- [Node.js: `path`](https://nodejs.org/api/path.html) — `join`, `relative`, `sep`, and the `path.posix` variants when you want forward slashes on purpose.
- [Node.js: Errors — common system errors](https://nodejs.org/api/errors.html#common-system-errors) — `ENOENT`, `EACCES`, `EXDEV` and the rest of the codes ex5 and ex7 branch on.
- [Node.js: `crypto.createHash()`](https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options) — the digest ex8 groups by, and the streaming interface a large-file version would use.
