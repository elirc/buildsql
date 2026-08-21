# Reading — react/06_effects

## Notes

**When effects run.** React renders (calls your function), commits (updates the
DOM), the browser paints, and then `useEffect` callbacks fire. That ordering is
why an effect can safely read the DOM and why it never blocks the first paint.
`useLayoutEffect` is the same hook moved earlier — it runs after the commit but
*before* the browser paints — and exists for the narrow case where you must
measure and adjust the DOM without the user seeing a flash. Reach for
`useEffect` by default; if something visibly flickers, that is the signal to try
the other one.

**Strict Mode double-invokes effects on purpose.** In development, React mounts
a component, runs its effects, runs its cleanups, and runs the effects again.
This is not a bug and is not something to work around: it is a test that your
effect is *resilient to being run twice*, which is the same property that makes
it correct when a dependency changes. An effect that opens a connection and
never closes it survives one mount and breaks under the double invoke — which
is the point. The gates in this course do not enable Strict Mode, but the
production apps you write should.

**Cleanup runs before every re-run, not only on unmount.** The lifecycle of one
effect is: run, later clean up, and that pair always belongs to a single render.
That is what makes `onClear("Saved")` in review1 fall out for free — the
cleanup closes over its own render's props. People are surprised by this because
they think of the cleanup as "the unmount handler"; it is better described as
"the undo for this particular run".

**Effects you should delete.** The official guidance list, worth memorising
because it is also an interview topic: do not use an effect to transform data
for rendering (compute during render), to reset state when a prop changes (use
a `key` instead), to handle a user event (put it in the handler), or to notify a
parent about a state change (call the parent's callback in the same handler that
changed the state). Each of these produces an extra render pass and a moment
where the UI is showing something stale.

**Racing and ordering.** Any effect that starts something asynchronous has to
consider what happens if it is superseded before it finishes. The `cancelled`
flag pattern — set a local `let cancelled = false`, check it before setting
state, flip it in the cleanup — is the smallest complete answer, and lesson 07
is entirely about the failure it prevents.

## ex1 — an effect and its exact undo

`document.title` is the smallest possible "outside React" system, which makes it
a clean first effect: something to set, something to restore, and a dependency
that decides when to redo it.

The detail that matters is *where* the previous title is captured. Reading it
inside the effect body means each run of the effect captures the value that was
true when it ran, and the cleanup closes over that same `const`. Hoisting it to
a `useRef` or module variable seems tidier and quietly breaks: two components
doing this at once would overwrite each other's idea of "previous".

The honest caveat about this pattern in production: two components each setting
`document.title` will fight, and the last one to render wins. Title management
usually belongs to a single owner — a router, a layout component, or a small
library that keeps a stack. That is a good illustration of the general rule that
effects mutating shared global state need an owner, not a convention.

## ex2 — what the dependency array actually claims

The stub's effect had no array, so it ran after every render, and the outside
world was told the theme changed when only a label had. That is the least
dangerous of the three failure modes — it is merely wasteful — but wasteful
effects become real bugs the moment the effect does something non-idempotent:
sending an analytics event, appending to a log, opening a connection.

The mechanical rule for filling the array in: every value the effect body reads
that comes from inside the component. `theme` obviously; `onSync` because it is
a prop that could be a different function next render. People routinely leave
function props out because "it's always the same function" — and it is, right
up until the parent stops memoizing it, at which point either the effect runs
too often or, if you also lied about a value, calls a stale callback forever.

The `react-hooks/exhaustive-deps` lint rule implements exactly this analysis and
is essentially never wrong about what an effect reads. It can be wrong about
what you *want*, and the honest response to that is to change the code so that
the deps you want are the deps you need — not to silence the rule. Every
codebase with `// eslint-disable-next-line react-hooks/exhaustive-deps`
scattered through it has at least one stale-closure bug nobody has found yet.

## ex3 — subscriptions, and the identity of a function

Two things make this exercise more than boilerplate.

The first is that `removeEventListener` compares function references. Passing a
freshly created arrow to both `add` and `remove` removes nothing and leaks a
listener on every effect run. Declaring the handler *inside* the effect
guarantees both calls see the same reference — which is why the idiom looks the
way it does.

The second is what "leak" means here. After unmount, a listener still attached
to `document` holds a reference to your component's closure, which holds its
props and state, which holds whatever those reference — so the whole subtree
stays in memory. Worse, if the handler calls a state setter, React used to warn
about setting state on an unmounted component; the warning was removed because
it produced too many false positives, which means the leak is now silent. The
cleanup is the only thing standing between you and it.

The dependency on `onClose` deserves a thought. Listing it means the listener is
removed and re-added whenever the parent passes a new function — which, if the
parent creates it inline, is every render. That is cheap for a DOM listener and
expensive for a WebSocket, and it is one of the situations that motivates
`useCallback` in lesson 11 and the `useEffectEvent` API React has been
developing for effects that need to "read the latest" without re-subscribing.

## ex4 — fetching, and why the fetcher is a prop

Injecting `fetchUser` rather than importing it or calling `fetch` directly is
the single most useful testing decision in this whole track, and it is not a
testing trick — it is dependency inversion. The component states what it needs
("something that turns an id into a promise of a user") instead of naming a
specific implementation. The gate can then hand it a fake with no network, no
mock-server, no timing, and no flakiness.

The dependency array is the whole difficulty. Omit it and you get the canonical
React disaster: fetch → setState → render → fetch → setState → render, forever,
several times a second, against somebody's API. Every experienced React
developer has shipped this once. The reason it is so easy to write is that the
loop is invisible in the code; you have to reason about it.

Two more points about `fetchUser` in the deps. It is correct to include it, and
it is safe here because the gate passes the same function every render. If a
parent created it inline, the effect would refetch on every render — the same
infinite loop through a different door — and the fix belongs in the parent
(`useCallback`, or defining the function outside the component), not in a
shortened dependency array.

Finally, the `cancelled` flag. Even with correct deps, a promise in flight when
the component unmounts will still resolve, and its `.then` will call `setUser`
on something that no longer exists. React tolerates this without complaint
these days, but the work is wasted and — if the component is still mounted with
a *different* id — the answer to a question nobody is asking anymore can
overwrite the answer to the question they are. That is lesson 07.

## challenge — the stale closure, in the wild

This is the bug this lesson exists for. Write out the sequence precisely,
because the precision is what makes it stop being mysterious:

1. `running` becomes `true`, so the effect runs. At that moment `seconds` is
   `0`, and the arrow function passed to `setInterval` closes over that `0`.
2. One second later, the callback runs and calls `setSeconds(0 + 1)`. State
   becomes `1`, the component re-renders.
3. `running` did not change, so the effect does **not** re-run. The interval is
   the same interval, holding the same callback, still closed over `0`.
4. Two seconds later it calls `setSeconds(0 + 1)` again. State is already `1`,
   `Object.is(1, 1)` is true, React bails out. The clock is frozen at 1 forever.

Adding `seconds` to the dependency array does fix the number — the effect now
re-runs after each tick with a fresh closure — but look at what it costs:
`clearInterval` and `setInterval` every second, so the timer restarts from zero
each time and the cadence drifts. That is a real technique for some problems and
the wrong one here.

`setSeconds((previous) => previous + 1)` fixes it properly because the callback
stops reading state altogether. It no longer says "set it to one more than the
value I remember" but "increase whatever it is by one" — a description of a
change rather than a captured value. The effect's dependency list shrinks
honestly to `[running]`, the interval survives, and the deps are now telling the
truth.

The generalisation is worth carrying: **when the dependency array feels like a
fight, the effect is usually reading a value it should have been describing.**
Updater functions, refs, and reducers are all ways of describing a change
without capturing the current state.

## review1 — whose values does a cleanup see?

The gate asserts on the *argument* of `onClear`, which is the only way to
observe the answer. When the message changes from `Saved` to `Deleted`, React
runs the cleanup created by the `Saved` render — which closed over `Saved` — and
only then runs the new effect. So the sequence is announce("Saved"),
clear("Saved"), announce("Deleted"), and on unmount clear("Deleted").

Once you have seen it once, a lot of effect code stops being surprising. A
cleanup that closes a socket closes *the socket its own run opened*, not the
current one. A cleanup that cancels a request cancels *its own* request. That
pairing is what makes effects composable at all, and it is why the `cancelled`
flag in ex4 works: the flag is a fresh `let` per effect run.

## Further reading

- [react.dev — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) — the model this lesson teaches, including the double-invoke rationale.
- [react.dev — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) — the single most valuable React page on the internet; read it twice.
- [react.dev — Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) and [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies) — the dependency array, honestly.
- [react.dev — `useEffect` reference](https://react.dev/reference/react/useEffect) — the parameter contract, plus a long list of "I'm having trouble with…" cases.
- [MDN — `EventTarget.removeEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) — why the function identity in ex3 matters.
- [MDN — `setInterval`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval) — including the drift the challenge's alternative fix would introduce.
