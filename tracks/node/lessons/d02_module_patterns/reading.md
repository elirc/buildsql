# Reading - node/d02_module_patterns

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **ownership**: for every piece of state in a module,
who creates it, when, and how many of it exist. A module body runs once per
process, so anything you write at module scope is a singleton whether you meant
it or not — which is the source of the shared-store bug in ex5, the frozen
defaults bug in ex3, and half the "works alone, fails in the suite" reports you
will ever triage. The pattern that unites all eight answers is the same move:
push creation into a **function** and hand the result to the caller, so the
module exports a way to build one rather than the one. Lazy (ex1, ex4),
validated (ex2), copied (ex3), injected (ex5), staged (ex6), graphed (ex7, ex8)
— all of them are that move applied at a different scale.

## ex1 — the flag is not the value

**What it tested:** whether your memo distinguishes "has not run" from "ran and
produced nothing", and whether a failure is a state you can recover from.

**The classic mistake:** `if (value === undefined) value = factory()`. A factory
that legitimately returns `undefined` re-runs on every call, which turns a lazy
singleton into an eager multiplier — and if the factory has side effects, into a
bug you find in production.

**Model answer:** a separate boolean, set *after* the factory returns, so a
throw leaves the flag false and the retry is free. That is exactly what
`require()` does with a module whose body threw, and saying so is the sentence
an interviewer is listening for.

## ex2 — errors at the boundary

**What it tested:** that a lookup table is a place to *refuse* things. Two
plugins registering `csv` is a bug; returning `undefined` for `xml` moves the
crash three frames away from the cause.

**The classic mistake:** a plain object as the store. `{}` inherits
`toString`, `constructor` and friends, so `has("constructor")` is `true` on an
empty registry and `get("constructor")` hands out a function. `Map` has no
prototype chain to trip over and no coercion of keys.

**Model answer:** `Map` plus two guards, and `names()` returning a fresh sorted
array rather than the live key iterator — the same instinct that makes
`history()` copy in ex5.

## ex3 — shallow is the default, twice

**What it tested:** two independent depths that both default to shallow. Object
spread merges one level; `Object.freeze` freezes one level. The exercise needs
both to go one deeper, and needs you to notice they are separate problems.

**The classic mistake:** module-level `const DEFAULTS`. `{ ...DEFAULTS }` copies
the top level but every call then shares the *same* `limits` object, so the
first `Object.freeze` freezes it for the whole process and the second call
inherits a frozen nested object it did not create. The symptom is a test that
passes alone and throws in the suite.

**Model answer:** a `defaults()` function returning a fresh graph, an explicit
spread for the nested object, and freezing the children before the parent —
because after the parent is frozen you can still reach the children, which is
precisely the hole being closed.

## ex4 — the shape before the contents

**What it tested:** getters, and the reason a lazy namespace beats a lazy
function: callers can enumerate what exists without paying to build it.

**The classic mistake:** `Object.defineProperty` defaults `enumerable` to
`false`, so a correct-looking implementation returns an object whose
`Object.keys` is empty — the namespace becomes invisible to every tool that
introspects it. The other mistake is one shared memo cell for all properties,
which happens the moment the `built` flag is hoisted above the loop.

**Model answer:** one `defineProperty` per entry, `enumerable: true` stated
explicitly, and the `let` pair declared *inside* the loop body so each getter
closes over its own.

## ex5 — the module that takes what it needs

**What it tested:** inversion of control at the smallest useful scale. A service
that imports its clock cannot be tested without freezing time globally; a
service that takes `now` can be tested with a two-line fake, which is exactly
what the gate does.

**The classic mistake:** `const defaultDeps = { store: createMemoryStore() }` at
module scope. Every service in the process then appends to one array — and
because the first test to run is usually the one that passes, the failure shows
up somewhere else entirely.

**Model answer:** `{ ...createDefaultDeps(), ...overrides }`, where the defaults
are built per call. Shallow merge is the right depth here: a dependency is
replaced whole or not at all.

## ex6 — a lifecycle is a contract about time

**What it tested:** staging. Registration, setup and teardown are three
different moments, and the value of the pattern comes from refusing to blur
them — which means the interesting code is the guards, not the happy path.

**The classic mistake:** tearing down in registration order. Plugins are
normally built on the ones before them, so shutting down the logger before the
router that logs its shutdown is how you lose the last, most useful lines of a
crash. The mirror mistake is running `setup` at `use()` time, which makes plugin
order depend on import order.

**Model answer:** one `running` flag guarding all four transitions, one `api`
object shared by every `setup`, teardowns collected in order and replayed
backwards.

## ex7 — a stack is what turns a hang into a message

**What it tested:** singleton resolution plus loop detection, and the discipline
to keep the bookkeeping balanced on the error path.

**The classic mistake:** detecting the cycle but leaving the name on the
resolution stack, because the pop sits after the `return` instead of in a
`finally`. Everything resolved afterwards then reports a phantom circular
dependency, and the second bug hides the first. The other classic is using a
`Set` for the stack, which detects the loop but cannot print the path — and the
path is the only part a human needs.

**Model answer:** an array as the stack, `slice` from the first occurrence to
build the message, and `try`/`finally` around the factory call so the pop
happens whatever the factory does.

## ex8 — deterministic is a requirement, not a nicety

**What it tested:** Kahn's algorithm, plus the observation that a topological
sort has many valid answers and a build system needs exactly one of them.

**The classic mistake:** draining every unblocked node in a batch. Removing one
node can unblock another that sorts earlier than the rest of the batch, so
batching produces a valid order that is not the *stable* one — and a plugin
order that changes when someone reorders an array is a bug report nobody can
reproduce. Skipping the up-front validation is the other one: a typo in `after`
then surfaces as "circular dependency", which sends the reader hunting for a
loop that does not exist.

**Model answer:** validate all `after` names first, then loop: sort the
currently-ready names, take exactly one, delete it from every remaining
blocker set, and report whatever is left over if a pass finds nothing ready.

## Further reading

- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) — the mechanism every one of these eight answers is built on.
- [MDN: `Object.defineProperty()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) — property descriptors, getters, and why `enumerable` defaults to `false`.
- [MDN: `Object.freeze()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) — including the explicit note that the freeze is shallow.
- [MDN: `Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) — key handling and the comparison with plain objects that ex2 turns on.
- [Node.js: Modules — caching](https://nodejs.org/api/modules.html#caching) — why module scope is process-wide singleton scope, which is the premise of this whole set.
