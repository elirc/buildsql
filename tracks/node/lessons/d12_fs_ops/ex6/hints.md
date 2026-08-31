## Hint 1

`mkdtemp(path.join(tmpdir(), "some-prefix-"))` creates the directory and gives
you its path in one call, appending random characters to the prefix. That is why
two calls back to back can never collide — and why you should not roll your own
name from `Date.now()`.

## Hint 2

`try { return await run(dir) } finally { await rm(...) }`.

`finally` rather than a line after the call, because the failure path is exactly
the one where a half-written workspace is lying around. And `return await`
rather than `return`, or the function returns the pending promise, `finally`
runs immediately, and the directory is deleted while the work is still using it.

`rm(dir, { recursive: true, force: true })` — recursive because the work put
things in there, force so an already-missing directory is not an error.

## Hint 3

Note what this helper does *not* do: it does not swallow the failure. The `try`
has no `catch`, so a rejection from `run` passes straight through while the
cleanup still happens. That is d06's `withCleanup` again, and it is worth
noticing that the pattern is the same one.

The remaining decision is what should happen if the *cleanup* fails — a Windows
antivirus holding a handle open is the usual culprit. As written, that failure
replaces whatever `run` was reporting. Decide whether you would rather it did
not.
