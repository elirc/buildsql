# Reading - typescript/i2_interview_drills

The debrief. For each drill: what the interviewer was actually marking, the
mistake most candidates make, and the sentence that would have earned the point.

## Notes

**What a live-coding round measures.** Not whether you finish — most
interviewers have seen their own question take longer than they expected. They
are marking process: did you ask about the edge cases first, did you write the
signature before the body, did you narrate, did you catch your own bug. A
candidate who says "before I start — what should happen when two items have the
same key?" has already scored, whatever the code looks like ten minutes later.

**Type the signature first, out loud.** Every drill here is easier once the
signature exists, and saying it aloud gives the interviewer a chance to correct
your understanding before you spend eight minutes on the wrong function. It also
demonstrates the thing they most want to see: that you think in types rather
than adding them afterwards.

**Name your trade-offs as you make them.** "First occurrence wins — I would
document that", "this is a trailing-edge debounce; lodash also offers leading",
"I compare with `Object.is` so setting the same value does not notify". Each of
those is one sentence and each one converts a coding decision into visible
judgement.

**Finish with what you would do next.** "With more time I would add `cancel` to
the debounce, catch throwing listeners in the store, and write a type test for
the emitter." That closes the round on your terms and shows you know the
difference between a drill and production code.

## ex1 — groupBy

What is being marked: whether you reach for a generic without being asked, and
whether the accumulator's type is written down. `Record<string, T[]>` in the
signature is what makes `groups[k].push(item)` typecheck; the version that
starts with `const groups = {}` gets `{}` and then fights the compiler.

The mistake to avoid is calling the key function more than once per item — cheap
here, expensive when the key involves a hash or a date parse. Compute it once
into a local.

Two sentences worth saying out loud. First, the ordering guarantee: items stay
in input order within each bucket, which falls out of a single forward pass and
is the behaviour callers assume. Second, the object-versus-`Map` trade: an
object serialises to JSON and takes string keys, a `Map` preserves insertion
order of keys and takes any key type. Interviewers ask "why an object?" and a
candidate with an answer stands out.

## ex2 — a typed event emitter

This is the canonical TypeScript design question, and the marking scheme is
almost always the same: `interface EventMap`, then
`on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void)`.
If you produce that signature in the first two minutes you have passed; the
bodies are ordinary JavaScript.

The internal storage is where honest candidates get uncomfortable, and it is
worth pre-empting: a single map cannot hold handlers for different events with
precise types, because each key's handlers have a different parameter type. Every
real implementation stores them loosely and casts at the two edges. Saying "the
public API is precise and there is one deliberate cast inside" is the
professional answer; silently reaching for `any` on the public signature is not.

Three details separate a good answer from an adequate one. Returning an
unsubscribe function rather than requiring an `off(event, handler)` — because
the caller then cannot get the handler reference wrong. Iterating a *copy* of
the handler set when emitting, so a handler that unsubscribes during dispatch
cannot corrupt the iteration. And having an opinion about a throwing handler:
Node's `EventEmitter` lets it propagate, most application emitters should catch
and continue.

## ex3 — promisify

Two skills in one small drill. The runtime half is the error-first convention —
`(error, value)` where the value is only meaningful when `error` is null — and
the `value as T` cast is forced by the callback type's optional `value?`. That
cast is defensible and worth narrating: "the convention guarantees a value when
the error is null; the type cannot express that, so I assert it here."

The type half is the one people freeze on. `Promisified<F>` is a conditional
type with `infer` pulling the payload out of the callback's parameter:

```ts
type Promisified<F> = F extends (callback: Callback<infer T>) => void ? () => Promise<T> : never;
```

If you have seen `ReturnType` and `Awaited`'s implementations, this is the same
move. If you froze, that is the signal to redo `09_mapped_conditional`.

The follow-up they will ask: what if the callback fires twice? A promise ignores
every settle after the first, so a double-calling callback silently loses data —
which is either fine or a bug worth logging, and knowing that it happens at all
is the point.

## ex4 — debounce

Debounce is asked because it is a closure question wearing a utility's clothes.
The two mistakes are storing the timer *inside* the returned function (so it is
recreated every call and nothing is ever cancelled) and forgetting to pass the
arguments through, which the gate catches by asserting the call happened with
`"c"`.

`Parameters<F>` is what makes the wrapper's signature honest, and
`ReturnType<typeof setTimeout>` is the spelling that works in both Node and the
browser — `number` in one, a `Timeout` object in the other. Reaching for
`NodeJS.Timeout` in a browser project is a small tell.

Be ready for two follow-ups. "How would you add leading-edge behaviour?" — call
immediately if there is no pending timer, then suppress until the window
closes. "What is the difference from throttle?" — debounce waits for quiet;
throttle guarantees at most one call per interval regardless of quiet. Search
inputs want debounce; scroll handlers want throttle.

## ex5 — flatten a comment tree

The marking is on the traversal order and the optional `children`. Pre-order
depth-first is what a rendered comment thread needs, and saying "parent before
children, subtree before next sibling" before you write proves you understood
the requirement rather than guessing.

`node.children ?? []` is the small elegance: it turns the optional property into
"nothing to recurse into" and removes an `if`. The alternative,
`if (node.children) walk(node.children, depth + 1)`, is equally correct and one
line longer.

The follow-up is always depth. Recursion is limited by the call stack — around
ten thousand frames in Node — so a pathologically deep tree overflows. The
iterative version pushes `[node, depth]` pairs onto an explicit stack, and
because a stack is LIFO you push children in reverse to keep the same order.
Knowing that conversion exists is usually enough; being able to write it is a
bonus.

## ex6 — type a `pipe`

This drill tests whether you know what overloads are *for*: one runtime
function, several compile-time contracts, where the result type depends on the
arguments. A single generic signature cannot do it, and candidates who try
usually end up with `unknown` and a cast at every call site.

The implementation signature (`(value: unknown, ...fns: ((input: unknown) =>
unknown)[]) => unknown`) is invisible to callers, so it can be as loose as it
needs to be — and TypeScript checks it only loosely against the overloads, which
means the overloads are a promise you own. That sentence is the one that earns
the point.

Two things worth mentioning. Real libraries write eight or ten overloads by
hand for exactly this reason; variadic tuple types can express it generically
but with worse error messages. And `reduce` is the natural body: threading a
value through a list of functions *is* a fold.

## challenge — the typed store

A take-home is marked on API design, not on line count. The four members here
are the smallest interesting state container, and each carries a decision worth
narrating.

`setState` accepting `S | ((current: S) => S)` is React's shape, and it exists
because callers who derive the next state from the current one otherwise race
with each other. The typing wrinkle is real: `typeof updater === "function"`
cannot narrow a generic `S` that might itself be a function type, so one cast is
the accepted answer — say so rather than hiding it.

The `Object.is` no-op is the detail that separates people who have used a store
from people who have read about one. Without it, every `setState` notifies, and
in a React app that means a render per call whether anything changed or not.
`Object.is` rather than `===` because it treats `NaN` as equal to itself, which
`===` does not.

Iterating a copy of the listener set is the same defensive move as in the
emitter, and it matters more here: a listener that unsubscribes itself on first
call is a normal pattern. And `select<R>(selector: (state: S) => R): R` is
`Box.map` from lesson 06 wearing a different name — a method-level type
parameter on a type-level generic.

If the interviewer asks what is missing before this is production-ready: batching
(so several `setState` calls in one tick notify once), reference-equality
selectors with memoisation, and something to catch a throwing listener.

## review1 — mapValues

The drill that looks trivial and is not, because `Object.keys` is typed
`string[]` rather than `(keyof T)[]`. That is deliberate and sound: structural
typing means a value can always have more properties than its type declares, so
the compiler cannot promise the key list matches the type. Every implementation
therefore contains one cast, and being able to explain *why* — rather than
apologising for it — is exactly what this review is training.

`{} as Record<keyof T, U>` for the accumulator is the same "object under
construction" problem as `pickKeys` in lesson 08. The `Object.fromEntries`
alternative trades the loop for a different cast and loses the key literals,
which is a fair trade to describe out loud.

Bringing this back through `dojo review` is deliberate: `keyof`, indexed access
and one honest cast are the three things this whole track has been circling, and
they are what a mid-level TypeScript interview is most likely to poke at.

## Further reading

- [Handbook: More on Functions — overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads) — the mechanism behind the `pipe` drill.
- [Handbook: `keyof` and Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) — the pair behind the emitter, `mapValues` and half of every typed library API.
- [MDN: closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) — the JavaScript half of `debounce`, `once` and the store.
- [Vitest: fake timers](https://vitest.dev/guide/mocking#timers) — how the debounce gate advances time without waiting for it.
- [Zustand source](https://github.com/pmndrs/zustand/blob/main/src/vanilla.ts) — the challenge, as shipped: about forty lines, and every decision in this drill appears in it.
