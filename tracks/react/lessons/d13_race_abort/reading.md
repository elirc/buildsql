# Reading — react/d13_race_abort

## Notes

Every problem in this set is the same shape: two requests exist at once and the
one you stopped caring about answers anyway. What changes from problem to
problem is *what the component can hang the answer on*. When the request was
started by an effect, the effect's own cleanup is the hook — a `let` declared
inside the effect body, flipped on the way out, read before any `setState`.
When the request was started by a click, no effect re-ran and no cleanup fired,
so the component has to number its own requests. When the request is real
network traffic, a flag only hides the answer while the bytes keep coming, and
an `AbortController` stops the work itself. And in the last problem the race
stops existing, because answers are stored under the question that produced
them rather than under "the current answer". Interviewers like this material
because the bug never appears on a fast machine or a small dataset: it appears
in production, for the one user on hotel wifi, as a screen that shows somebody
else's data.

## ex1

Tests the base pattern: a flag scoped to one run of the effect. The classic
mistake is assuming React's own cleanup already handles it — it does not; React
has no idea a promise exists, and the `.then` closure outlives the effect that
created it. The model answer declares `let current = true` in the effect body
so the cleanup flips exactly the flag belonging to the run it is retiring, and
the callback returns early rather than calling `setDepartures`.

## ex2

Tests whether the guard covers both branches of the promise. The classic
mistake is guarding `.then` and leaving `.catch` open, which lets a dead
request paint an error alert over a screen that was already correct — and
because errors are usually rendered instead of data, the user loses the good
answer as well. The model answer passes both callbacks to a single `.then(ok,
fail)` with the same check at the top of each, and clears the previous error
when the id changes so an old alert cannot survive into a new request.

## ex3

Tests the difference between ignoring an answer and cancelling the work. The
classic mistake is creating an `AbortController` and never keeping it, so its
signal goes out and nothing ever aborts — the request still downloads, still
costs the user bandwidth, still occupies a connection. The model answer builds
one controller per effect run, aborts it in the cleanup, and treats
`signal.aborted` as the guard, remembering that the abort surfaces as a
rejection it must not report.

## ex4

Tests whether you recognise the race when a keystroke starts it rather than a
prop. The classic mistake is firing the request straight from the change
handler, where there is no cleanup and no way to know a later keystroke has
happened, so the shortest query — which the server answers fastest, or slowest,
depending on the day — wins at random. The model answer keeps the handler down
to `setQuery` and moves the request into an effect that depends on the query,
which turns each keystroke into a retirement of the previous run.

## ex5

Tests the case the flag pattern cannot reach. The classic mistake is
concluding that two clicks with no prop change cannot race — they can, and the
symptom is a balance that flickers back to an older number. The model answer
keeps a monotonically increasing request number in a `useRef`, captures it when
the request goes out, and compares it against the newest number when the answer
returns; a boolean would either wedge the component or fail to distinguish the
two in-flight requests.

## ex6

Tests where the guard lives. The classic mistake is reaching for `useRef`
because "it survives renders", which is true and exactly wrong: one ref is one
box shared by every run of the effect, so the first cleanup sets it to `false`
and no later answer is ever accepted again — the component simply stops
updating, which is far worse than the stale answer it was trying to prevent.
The model answer uses a local `let`, giving each run its own box, and the
cleanup closes over the box belonging to its own run.

## ex7

Tests guarding a chain rather than a single request. The classic mistake is
one check before the final `setState`, which is enough to keep the wrong data
off the screen but still fires the second request for a trip nobody is looking
at any more — a wasted round trip, and a real bug when the second call is a
mutation rather than a read. The model answer asks the same question again at
every point where the chain is about to spend something, using one flag for the
whole run because the cleanup retires both steps at once.

## ex8

Tests the idea that dissolves the whole category. The classic mistake is
storing "the answer" in one slot and cancelling anything that does not belong
there, which throws away a true answer and then pays for it again when the user
comes back. The model answer keys the answers by metric and renders the slot
the selected tab points at, so a late answer lands in its own slot and could
not be displayed by accident; the set of already-requested metrics lives in a
ref, because it never needs to be rendered and putting it in state would put it
in the effect's dependencies.

## Further reading

- [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
- [`useEffect` reference](https://react.dev/reference/react/useEffect)
- [`useRef` reference](https://react.dev/reference/react/useRef)
- [MDN: `AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [MDN: `AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
- [MDN: `Promise.prototype.then()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)
