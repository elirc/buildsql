## Hint 1

Two independent requirements, and people usually get one of them:

- **merge depth.** `{ ...defaults, ...overrides }` replaces `limits` entirely,
  so an override of `timeoutMs` alone silently drops `maxBodyBytes`. The nested
  object needs its own spread.
- **freeze depth.** `Object.freeze` is shallow. `config.limits.timeoutMs = 1`
  still works after freezing `config`.

## Hint 2

The third requirement is the one that bites in production. If your defaults are
a module-level `const`, then `{ ...DEFAULTS }` copies the top level but every
call shares the *same* `limits` object — so the first `Object.freeze` freezes
it for the whole process, and the second call quietly inherits whatever the
first one did to it.

Make the defaults a function that returns a fresh object graph, and the problem
disappears. Freeze the nested pieces before the outer object, and decide for
yourself whether `tags` needs copying as well as freezing (ask what happens if
a caller keeps a reference to the array they passed in).
