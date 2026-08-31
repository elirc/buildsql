# Reading — react/d24_mixed_gauntlet

## Notes

The point of a cumulative set is that nothing tells you which idea is being
tested, which is the only condition under which you find out whether you have
learned them. Read back over the eight and the same three questions decide most
of the code. **What is really state?** — not the code, not the order of the
roster, not the total of a cart, not the validity of a form; those are all
questions you can answer from something smaller. **What does this effect
depend on, and what does it own?** — a timer that restarts, a subscription that
must not, a request that can be overtaken, a toast with a deadline of its own.
And **who needs to know?** — the id linking a trigger to its content, the
session a request belongs to, the step a nav is looking at, none of which the
caller should have to pass by hand. Almost every bug in Volume 2 has been one
of those three answered wrongly, which is worth more than any individual API.

## ex1

Controlled inputs, normalisation and derived state at once. The classic mistake
is normalising in the change handler and storing the result, which means the
user cannot type a space and watches their cursor jump; the second is judging
the raw string, so `"  ab  "` looks like six characters of voucher code. The
model answer keeps the typed value in state exactly as typed and derives the
code — and everything downstream, the message and the disabled button, is a
question about the derived value rather than about the box.

## ex2

List state, immutable updates and the empty case. The classic mistakes are a
list of leads that only ever grows, so two people are lead at once, and an
order kept in state that goes stale when the roster prop changes. The model
answer stores one thing — who leads — and derives the order from it, which
makes both problems unrepresentable, and remembers that an empty list is a
state with something to say rather than an empty `<ul>`.

## ex3

Timers, cleanup and the latest-callback ref. The classic mistake is an effect
with an empty dependency array, which starts the countdown once and never hears
about the activity that should restart it — the version of this bug in
production logs people out while they are typing. The model answer makes the
activity counter a dependency, so React's cleanup cancels the old timer for
free, stops counting once it is idle, and reads `onIdle` from a ref so the
countdown does not restart every time the parent re-renders.

## ex4

Context and a race. The classic mistake is fetching from a value that arrives
by context and forgetting that context values change like any other prop: two
requests end up in flight, and the slow answer to the previous session paints
one user's name over another's. The model answer keeps the guard where it
belongs — a `let` inside the effect body, flipped by the cleanup — and puts the
throw for a missing provider after every hook has been called.

## ex5

A hook, a reducer inside it, and derived state. The classic mistakes are a
total kept in state that nothing updates, and a hook that hands out new
functions on every render so every consumer of it re-renders for nothing. The
model answer computes the total from the lines while rendering and wraps the
two actions in `useCallback` with empty dependency arrays — possible because
`dispatch` is guaranteed stable — leaving the panel as pure markup that the
gate does not even need in order to test the cart.

## ex6

Per-item lifetimes. The classic mistake is one timer for the whole queue, which
cannot express "a second after *it* appeared" and cuts short every toast that
arrived late. The model answer gives each toast a component with its own effect
and its own timeout, which also makes dismissing by hand and unmounting fall
out of the same cleanup — and it keeps ids in a counter that only goes up, so a
number is never reused by a toast that arrives after one was dismissed.

## ex7

Debounce and race together, which is the pairing people get half right. The
classic mistake is a `setTimeout` with no cleanup: it delays every keystroke
rather than replacing it, so the requests all still go out, just late. The
second is assuming the debounce removed the race — it made it rarer, and a slow
answer to an abandoned query still arrives after a fast answer to the current
one. Two effects, two cleanups, and each one does exactly one job.

## ex8

A compound component that also has to manage focus. The parts have to find the
current step, the total and the two moves without the caller passing anything,
which is a context; only one step may render, which means the wizard has to
separate the steps from the rest of what it was handed. And the piece that is
invisible until somebody uses a keyboard: changing step removes the element
that had focus, so the new step's heading catches it — with `tabIndex={-1}`,
because a heading is not focusable otherwise.

## Further reading

- [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
- [Choosing the state structure](https://react.dev/learn/choosing-the-state-structure)
- [Scaling up with reducer and context](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [Reusing logic with custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [MDN: `HTMLElement.focus()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)
