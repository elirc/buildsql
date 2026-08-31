# Reading - typescript/d21_async_typing

The debrief. Per problem: what the signature was really promising, the version
that runs and lies about its shape, and one sentence on the model answer.

## Notes

**An `async` function's annotation describes what the promise resolves to.**
`Promise<R[]>` is one promise of many results; `Promise<R>[]` is many promises;
`R[]` on an `async` function is a compile error. Most of the type slips in this
area are a misplaced pair of brackets, and they are caught the moment somebody
tries to `await` the thing.

**Where the `await` sits decides the concurrency, and the types cannot see it.**
Three awaits in a row and one `Promise.all` have identical signatures and
different latency (ex1, ex2). That is why this lesson's runtime gate records
*when* things start rather than only what they return - it is the only
observable difference.

**The four combinators answer four different questions.** `Promise.all` is
all-or-nothing and gives you a tuple. `Promise.allSettled` never rejects and
gives you a discriminated union per input. `Promise.race` takes the first to
settle, rejection included. `Promise.any` takes the first to *fulfil*. Picking
the wrong one is a behaviour bug the type system will happily wave through.

**`never` and `Awaited` do quiet work in these signatures.** A promise that only
rejects is `Promise<never>`, so racing it against `Promise<T>` leaves
`Promise<T>` untouched (ex6). `Awaited<T>` unwraps any depth of promise and
leaves plain values alone, which is what lets one mapped type handle a tuple of
mixed inputs (ex8).

**And async code is testable without waiting.** Every exercise here that needs
something to be pending gets a deferred promise - a promise plus its `resolve`
and `reject`, kept by the test - so the test controls the interleaving exactly.
No `setTimeout`, no flaky ordering, no sleeping in a test suite. Where a real
timeout is needed, inject it as a promise (ex6) rather than reaching for a timer
inside the function.

## ex1 - one at a time, in order

What this was testing: the shape of an async return type, and the difference
between mapping and sequencing. `async` functions always return a promise, so
the annotation describes what the promise resolves to - writing `Promise<R>[]`
there is a common slip that typechecks at the declaration and fails at every
call site.

The classic mistake is `values.map(fn)` followed by `Promise.all`, which
produces the right array in the right order and starts everything at once.
Sometimes that is what you want; when it is not - a rate-limited API, a
database that will deadlock - it is a bug the type system cannot see, which is
why the gate records the interleaving.

The model answer awaits inside the loop and pushes, so at most one call is in
flight and the results array is built in order by construction.

## ex2 - three loaders, one wait

What this was testing: concurrency as a property of *where the awaits are*, and
`Promise.all`'s tuple typing. Three sequential awaits and one `Promise.all` are
indistinguishable in the type signature and differ by a factor of three in
latency, which is why the gate measures behaviour rather than shape.

The classic mistake is `const user = await loadUser();` on three consecutive
lines. It reads beautifully and serialises three independent requests. The fix
is to separate starting from waiting.

The model answer starts all three in the argument list of `Promise.all` and
destructures the resulting tuple, so each name has its own type without a single
annotation in the body.

## ex3 - split the settled results

What this was testing: `Promise.allSettled` and the discriminated union it
resolves to. The point of the exercise is that partial failure is a normal
outcome - three of four dashboards loading is worth showing - and that
`Promise.all` cannot express it, because the first rejection discards the rest.

The classic mistake is reading `result.value` without checking `result.status`,
which does not compile - the standard library types this as a proper union
precisely so it cannot be got wrong. The second is typing the reasons as
`Error[]`: a promise can be rejected with a string, a number or `undefined`, so
`unknown` is the only claim you can defend.

The model answer awaits `allSettled`, walks the results once, and pushes into
the list the discriminant selects - so the fulfilled values stay in input order
and no rejection can take them down with it.

## ex4 - walk the pages

What this was testing: async generators as the natural type for a paginated
API, and the fact that `for await...of` consumes anything that implements
`AsyncIterable`. The generator hides the cursor entirely - the consumer sees a
stream of items and never learns that there were pages.

The classic mistake is fetching every page into an array before yielding
anything, which works and defeats the purpose: the point of a generator is that
the consumer can stop after ten items without the twentieth page ever being
requested. The second is checking `next` before yielding the current page's
items, which silently drops the last page.

The model answer loops forever, yields each item as it arrives, and returns when
`next` is `null` - and `collect` takes the widest type it can, `AsyncIterable<T>`,
so it is not tied to this generator.

## ex5 - try again, up to a point

What this was testing: the generic wrapper shape - `T` in, `Promise<T>` out -
and the one situation where `return await` earns its keep. A wrapper that
loosens the type is a wrapper every call site has to undo.

The classic mistake is `return task()` inside the `try`. The promise is handed
back before it settles, the `try` block exits successfully, and a rejection
lands on the caller with no retry ever happening. The second is throwing a new
`Error("all attempts failed")`, which is exactly the moment the original reason
was needed.

The model answer loops, returns on the first success, remembers the last error
as `unknown`, and rethrows it - so the failure the caller sees is the failure
that happened.

## ex6 - whichever settles first

What this was testing: `Promise.race`, and `never` as the return type of
something that only ever rejects. The union arithmetic is the pleasing part -
`Promise<T | never>` collapses to `Promise<T>`, so the timeout branch adds a
failure mode without widening the success type.

The classic mistake is racing `expire` as it is and then rejecting afterwards,
which resolves the race with `undefined` and hands the caller a value it never
asked for. The second is catching the task's rejection and rethrowing the
timeout message, which erases the real error.

The model answer maps the expiry to a `Promise<never>` that throws, races the
two, and stops there - and the fact that the losing task keeps running is a
property of promises, not an oversight.

## ex7 - at most n at a time

What this was testing: a small piece of concurrency machinery with an honest
signature. Every property that matters here - the limit, the ordering, the
per-call result type - is invisible to the type system except the last one, so
the runtime gate does most of the work and the type gate makes sure `add` did
not quietly become `Promise<unknown>`.

The classic mistake is decrementing the counter only on success, so one rejected
task permanently costs a slot; `finally` is the fix and is the reason it exists.
The second is putting the generic on `createQueue`, which forces every task in
one queue to return the same type.

The model answer counts running tasks, queues closures for the rest, and settles
each caller's promise from inside its own closure - so a task that fails rejects
its own `add` and nobody else is affected.

## ex8 - a tuple-shaped Promise.all

What this was testing: the whole toolkit pointed at one signature - a `const`
type parameter to preserve the tuple (d20), a mapped type over that tuple with
the `readonly` modifier removed (d14), and `Awaited` to unwrap each member
(d12). The runtime is one line; the exercise is the type.

The classic mistake is dropping `const`, after which `T` is
`(Promise<number> | Promise<string>)[]`, the mapped type produces an array
rather than a tuple, and both positions come out as the same union. The second
is hand-rolling the unwrap with a conditional, which is right until someone
passes a `Promise<Promise<T>>`.

The model answer is one mapped type and one cast, and it is the shape the
standard library itself uses for `Promise.all` - reading `lib.es2015.promise.d.ts`
after finishing this is worth the five minutes.

## Further reading

- [MDN: Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) - and the sibling pages for `allSettled`, `race` and `any`, which are ex2, ex3 and ex6.
- [MDN: for await...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) - the consumer side of the async generator in ex4.
- [Handbook: Awaited and Promise improvements](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#the-awaited-type-and-promise-improvements) - what `Awaited<T>` does that a hand-written conditional does not (ex8).
- [Handbook: Utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html) - `Awaited`, `ReturnType` and the rest, as the standard library defines them.
- [MDN: AsyncGenerator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator) - the three type parameters ex4 asks you to fill in.
