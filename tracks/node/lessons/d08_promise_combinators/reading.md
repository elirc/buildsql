# Reading - node/d08_promise_combinators

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **choosing a settling rule and implementing it
exactly**. Every combinator here is the same three lines of scaffolding — a
`new Promise`, a results array written by index, and a counter — with one
question answered differently: *what makes this settle, and what makes it give
up?* `all` settles on the last success or the first failure; `race` on the first
of anything; `any` on the first success or the last failure; and the four
hand-written ones settle on a deadline, a predicate, each arrival, or an
arithmetic proof that no answer is coming. Two facts do most of the work
throughout: a promise silently ignores every settlement after the first, so you
almost never need a `done` flag of your own; and writing results **by index**
rather than pushing is what keeps input order separate from completion order —
which several of these problems need to track at the same time.

## ex1 — index for order, counter for completion

**What it tested:** the two mechanisms every combinator is built from, and the
empty-array case.

**The classic mistake:** `results.push(value)` in the handler. It passes any
test where the inputs settle in order and silently scrambles the output when
they do not — which is to say, in production. Close behind: forgetting that an
empty array must resolve immediately, because a counter that starts at zero
never reaches zero by decrementing.

**Model answer:** a pre-sized array written at `index`, a `remaining` counter,
and `reject` passed straight through as the second `.then` argument — the first
rejection settles the promise and every later one is a no-op.

## ex2 — the shortest one is the one people overthink

**What it tested:** whether you trust the settle-once rule enough to write four
lines.

**The classic mistake:** adding a `settled` boolean and checking it in both
handlers. It is harmless and it is a tell: it means you are not sure what a
second `resolve` does. (Nothing. It does nothing.)

**Model answer:** attach `resolve` and `reject` to every input. The empty case
needs no branch — nothing is attached, so nothing settles, which is exactly what
`Promise.race([])` specifies.

## ex3 — the mirror image, and an error type most people have never constructed

**What it tested:** inverting ex1's logic, and knowing that `AggregateError` is a
real built-in with an `.errors` array rather than something you fake with a
joined message.

**The classic mistake:** collecting the reasons with `push`, so `.errors` comes
back in completion order. A caller trying to work out which of five replicas
failed now has to guess. The other one: treating `anyOf([])` like
`raceFirst([])` and leaving it pending. `any` resolves on a success, and with no
inputs there can never be one, so the outcome is already decided — the two empty
cases differ for a reason worth being able to state.

**Model answer:** `resolve` straight through, reasons stored by index,
`new AggregateError(errors, message)` when the outstanding count hits zero.

## ex4 — two orders at once

**What it tested:** holding input order and completion order in the same
function without confusing them.

**The classic mistake:** reporting progress with the index (`onProgress(index +
1, total)`), which produces a progress bar that jumps backwards whenever an
early input finishes late. Progress is a count of arrivals; the index is a
position. They are different numbers and both are in scope.

**Model answer:** write `results[index]`, increment a separate `done`, and call
`onProgress(done, total)` from the fulfilment handler — with the empty case
returning before any of it is wired up, so nothing is reported at all.

## ex5 — pre-fill, then overwrite

**What it tested:** combining `allSettled` semantics with a deadline, and timer
hygiene.

**The classic mistake:** working out at deadline time which inputs are still
missing. That needs a second structure — a set of settled indexes, usually — and
it is where the off-by-ones live. Filling the array with `timedout` up front
makes the deadline handler a one-liner. The other mistake is not clearing the
timeout on the early-completion path: the result is correct and the process
stays alive for the rest of the budget.

**Model answer:** `promises.map(() => ({ status: "timedout" }))`, overwrite each
slot as it settles, `clearTimeout` when the counter empties.

## ex6 — count the chances, not the failures

**What it tested:** a settle rule with three outcomes per input — match, no
match, rejection — where two of the three mean the same thing.

**The classic mistake:** counting only rejections towards giving up. When every
input fulfils with something the predicate turns down, nothing ever counts, and
the call hangs forever — which is the case the gate feeds it with `1` and `2`
against `> 10`.

**Model answer:** one `giveUp()` helper used by both the rejection handler and
the predicate's `else`, so "a chance was used up" is expressed once.

## ex7 — push meets pull

**What it tested:** the adapter between a callback-shaped world and a
pull-shaped one, which is what every async iterator over an event source is.

**The classic mistake:** attaching the handlers lazily, one per `yield`, which
serialises inputs that are already in flight and can miss settlements that
happen while the consumer is away. The subtler one is a wake-up resolver that is
not cleared before being called: a later settlement then resolves a promise that
has already been used, and the consumer sleeps through it forever.

**Model answer:** attach everything up front, buffer arrivals in a queue, and
loop — sleep on a fresh wake promise only when the queue is empty, then drain
the whole queue, because several inputs can land in one microtask checkpoint.

## ex8 — settle when the answer is decided, not when the work is done

**What it tested:** forward-looking failure detection. Every other problem here
gives up when the inputs run out; this one has to give up when the *arithmetic*
runs out.

**The classic mistake:** waiting for every input before deciding there is no
quorum. With two voters, a quorum of two and one rejection, the answer is
already known and the call sits there waiting for a vote that cannot change
anything — which in a real quorum read means holding a request open on a replica
that will never reply.

**Model answer:** after every settlement, compare `leader + undecided` with the
quorum and reject the moment it falls short. That one expression covers the
all-settled case, the early-impossible case and the empty-input case, which is
why none of them needs a branch of its own.

## Further reading

- [MDN: `Promise.all()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) — the ordering and fail-fast rules ex1 reimplements.
- [MDN: `Promise.any()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any) — including the `AggregateError` contract from ex3.
- [MDN: `AggregateError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError) — how to construct one and what `.errors` holds.
- [MDN: `Promise.allSettled()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) — the record shape ex5 and ex7 borrow.
- [MDN: `Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) — the equality `Map` keys use, which is what makes ex8's tally behave.
