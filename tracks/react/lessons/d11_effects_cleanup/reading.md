# Reading — react/d11_effects_cleanup

## Notes

One rule generates every answer in this set: **an effect synchronises an
external system with your component, and the cleanup un-synchronises it.** If
the effect started something, the cleanup stops that same thing — and React runs
it at two moments, before the next run of the effect and once on unmount. Read
those two moments together and the drills stop being eight different problems.
The pairs here are subscribe/unsubscribe, setInterval/clearInterval,
setTimeout/clearTimeout, addEventListener/removeEventListener and
connect/disconnect, and the failure is always the same shape: the setup ran more
times than the teardown. That imbalance shows up as a leak in production and as
a doubled subscription under StrictMode in development, which is exactly why
StrictMode double-invokes effects — it is a symmetry test you can run before
your users do.

## ex1

Tests whether you recognise a teardown when an API hands you one. The classic
mistake is calling `subscribe(...)` and discarding its return value, which
leaves the source holding a callback into a component that no longer exists —
the leak that later shows up as "setState on an unmounted component". The model
answer returns the unsubscribe function from the effect, which is all React
needs to run it at the right moment.

## ex2

Tests the same rule with a timer, where the symptom is louder: an interval that
is never cleared keeps firing forever and, worse, a component that mounts and
unmounts repeatedly leaves one running per mount. The classic mistake is
forgetting the handle entirely; the second is dropping the updater form in
`setSeconds`, so every tick adds one to the same captured value. The model
answer keeps the id in a `const` and clears it in the cleanup.

## ex3

Tests whether you know *when* cleanup runs, not just that it does. The gate
builds a log because ordering is the whole point: React runs the previous
cleanup before the next effect, so switching channels reads leave-then-join. The
classic mistake is hand-rolling the teardown in a ref, which usually gets the
ordering right and always forgets the unmount. The model answer returns the
disconnect function and deletes the ref.

## ex4

Tests cleanup as ordinary control flow. Pausing is not a special case: it is the
effect re-running with a changed dependency, and the previous run's cleanup is
what stops the interval. The classic mistake is starting an interval with no
cleanup, which leaves one running per Start ever pressed — the countdown then
accelerates, which is a bug users describe as "the timer went weird". The model
answer returns early when not running (registering no cleanup for that run) and
handles finishing separately, keeping the updater function pure.

## ex5

Tests two failures that share one cause: an effect claiming an empty dependency
array while reading a prop. The listener then calls the first render's
`onOutside` forever — a stale closure — and, with no cleanup, keeps calling it
after unmount, with a new listener added on every mount. The classic mistake is
adding `onOutside` to the array without adding a cleanup, which turns a stale
listener into a growing pile of them. The model answer declares the handler
inside the effect so the cleanup can remove that exact reference, and depends on
`onOutside`.

## ex6

Tests the debounce, which is not an algorithm here but a consequence of the
lifecycle. The classic mistake is starting a timeout with no cleanup: every
keystroke schedules a save and they all fire, which is the opposite of what a
debounce is for. The model answer clears the pending timeout in the cleanup, so
a change inside the window cancels the save that was about to go out — and the
unmount case is covered by the same two lines, for free.

## ex7

Tests idempotence, using StrictMode as the instrument. The classic mistake is
reading the doubled setup as a React quirk to be worked around — with a ref
guard, or by disabling StrictMode — rather than as the signal it is: setup ran
twice and teardown zero times, so the pairing is broken and production will leak
one connection per mount. The model answer changes nothing about the structure;
it just returns the close function, after which running setup twice leaves
exactly one connection open.

## ex8

Tests all of it at once, with a second dependency that decides whether the
effect should do anything at all. The classic mistakes are leaving `paused` out
of the dependency array (so pausing does nothing until something else changes),
and returning no cleanup, so resuming and switching source pile streams up
without closing any. The model answer puts every value the effect reads in the
array, returns early while paused, and returns the unsubscribe function
otherwise — one open stream at every point in the sequence, and none at the end.

## Further reading

- [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
- [Lifecycle of reactive effects](https://react.dev/learn/lifecycle-of-reactive-effects)
- [`StrictMode` reference](https://react.dev/reference/react/StrictMode)
- [`useEffect`: connecting to an external system](https://react.dev/reference/react/useEffect#connecting-to-an-external-system)
- [MDN: `clearInterval()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearInterval)
- [MDN: `EventTarget.removeEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)
