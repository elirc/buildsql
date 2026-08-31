# Reading — react/d20_custom_hooks_2

## Notes

Once a hook owns something outside React — a listener, a socket, a timer, a
poll — it owns the whole life of that thing, and two questions decide almost
every line. The first is what the effect really depends on. Callers write
handlers and loaders inline, so those arrive as new functions on every render;
listing them in a dependency array is honest and tears the subscription down
several times a second, while leaving them out is a lie that shows up as a
stale closure calling last week's callback. The way out, three times in this
set, is a ref holding the newest function, updated by its own tiny effect, read
at the moment the event happens — the pattern `useEffectEvent` is being designed
to replace. The second question is *when* a value has to be readable. State is
a value between renders; a ref is a value now. Whether a request is in flight,
which timeout is pending, what the state became a microsecond ago — none of
those can wait for a render, and all of them are refs. The rest of the set is
the recurring lesson that a hook's return value is an API: it must survive
renders unchanged, and it must not quietly stop tracking a prop that changed.

## ex1

Tests the latest-value ref in its smallest form. The classic mistake is the
empty dependency array, which promises the effect reads nothing that can change
while it reads two things that can — so the shortcut goes on calling the
handler from the first render. Adding `handler` to the array is the other
mistake: it is honest and it removes and re-adds a document listener on every
render. The model answer depends on `key` alone and reads the handler out of a
ref when the key is actually pressed.

## ex2

Tests cleanup, and rewards reading the API you were given. The classic mistake
is calling `subscribe` and dropping what it returns, which leaks one live
connection per change of source — all of them still pushing into a component
that has moved on. The model answer notices that an unsubscribe function and an
effect's cleanup are the same shape, and returns it directly.

## ex3

Tests derived state at the boundary. The classic mistake is treating the page
number as the truth: clamping it when the reader moves is easy, and nothing
clamps it when the *list* moves, so a filter that removes rows leaves somebody
staring at an empty page. The model answer keeps the page that was asked for in
state and computes the page that is shown during render, which also avoids the
frame of empty list that a correcting effect would commit.

## ex4

Tests what makes a debounce a debounce. The classic mistake is scheduling a
timeout per call and cancelling none, which delays every call instead of
replacing it. Two refs solve it: the pending timeout id, which must be readable
the instant the next call arrives, and the newest `fn`, which lets the returned
function keep its identity — and that identity matters, because whatever is
holding the debounced function would otherwise be holding a different debounce
with its own pending timeout.

## ex5

Tests initialisation against a moving target. The classic mistake is a lazy
`useState` initialiser, which is exactly right for the value and blind to the
key changing under it — the hook then shows one document's draft under another
document's name. The model answer stores the key beside the value so staleness
is a question it can ask, and adjusts the state during render rather than in an
effect, so no wrong pairing is ever committed.

## ex6

Tests overlapping work. The classic mistakes are the interval that is never
cleared and the tick that fires regardless — on a slow connection the second
turns one poll a second into a growing queue of requests, each answering later
than the last. The model answer keeps an in-flight flag in a ref, because it
must be true the instant the request goes out rather than after the next
render, and clears it on both the success and the failure path.

## ex7

Tests wrapping a hook without breaking its contract. The classic mistake is
reading `state` inside the wrapper, which is the render's value — the state
*before* the action — so every line of the log is one step behind. The model
answer calls the reducer itself, which is free because a reducer is pure, and
keeps the current state, the reducer and the log in refs so `dispatch` can have
an empty dependency array and stay as stable as the one React handed over.

## ex8

Tests the controlled/uncontrolled contract every component library implements.
The classic mistake is seeding internal state from the `value` prop and then
ignoring the prop, which produces a component that claims to be controlled and
shows something its parent does not believe. The model answer decides the mode
once, on the first render, keeps it in a ref, and always calls `useState` — the
number of hooks a component calls may not depend on a prop, even one it will
never use.

## Further reading

- [Reusing logic with custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Separating events from effects](https://react.dev/learn/separating-events-from-effects)
- [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
- [`useRef` reference](https://react.dev/reference/react/useRef)
- [Controlled and uncontrolled components](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components)
- [MDN: `EventTarget.addEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
