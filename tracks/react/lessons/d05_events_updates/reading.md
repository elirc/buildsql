# Reading — react/d05_events_updates

## Notes

A handler is a value, not an instruction. You write the function, you hand it to
React, and React calls it when something happens - which means every problem in
this set is really a question about *when* something runs and *what it can see
at that moment*. Three of them (ex1, ex2, ex6) are about that gap between
writing a call and scheduling one. Three (ex3, ex4, ex7) are about the DOM event
itself: it travels outwards from the element it started on, it carries a default
action the browser is about to perform, and it knows exactly where it began.
The last two are the ones that separate people who have shipped an input from
people who have not: modifier keys, and the fact that a single tap only becomes
a single tap once you have waited long enough to be sure.

## ex1

Tests the difference between a function and a call. The classic mistake is
`onClick={onRing()}`, which calls the handler during render and hands React
whatever it returned - usually `undefined`, so the button then does nothing at
all when clicked. The stub writes the same bug more plainly, as a bare call in
the body. The model answer passes a function React can hold onto and invoke
later.

## ex2

Tests closing over a value. Each button needs to send something different, and
that difference only exists in the JSX that built it, so each needs its own
small function created there. The classic mistake is one shared handler with no
argument - the stub's - which cannot tell the buttons apart, or
`onClick={onPress(2)}`, which calls immediately for the same reason as ex1. The
model answer wraps the call in an arrow function per button.

## ex3

Tests `preventDefault`. A link that the app handles itself must stay a real link
- real `href`, real `link` role, still openable in a new tab - while cancelling
the navigation the browser was about to perform. The classic mistake is either
forgetting to prevent it, so the SPA does a full page load, or replacing the
anchor with a `<div onClick>`, which destroys the semantics to fix the symptom.
The model answer keeps the anchor and calls `preventDefault` in the handler.

## ex4

Tests bubbling. The Dismiss button sits inside a clickable card, so a click on
it runs both handlers and the user gets the notification dismissed *and* opened.
The classic mistake is to reach for `preventDefault`, which cancels the browser
default and has nothing to do with propagation. The model answer calls
`event.stopPropagation()` in the inner handler, which ends the event where it
is - and is worth being able to describe as "stop travelling" versus "do not do
the browser thing".

## ex5

Tests reading the event before acting on it. A keydown carries the key and the
modifiers, and this component has to consult both: Enter alone submits, Shift
and Enter is a newline the textarea should insert itself. The classic mistake is
checking `event.key === "Enter"` and nothing else, which submits half-written
messages every time someone tries to start a paragraph. The second is forgetting
`preventDefault` on submit, which sends the message and then puts a newline in
the freshly emptied box.

## ex6

Tests the render snapshot. Inside a handler, `count` is a `const` from the
render the click belonged to, so `setCount(count + 1)` twice asks for the same
value twice and adds one. The classic mistake is exactly that, and the classic
follow-up mistake is "fixing" the log with the updater form as well - but the
log genuinely wants the value the user was looking at. The model answer uses the
updater form for the updates and the plain variable for the log, deliberately.

## ex7

Tests event delegation, which is what you fall back on when there are fifty
buttons rather than three, or when the buttons arrive after the listener did.
The classic mistake is the stub's: one listener that always sends the same
command, because reading the target was the part that was skipped. The second is
using `event.target` directly and being surprised when a click lands on an icon
inside the button. The model answer uses `closest("button")` and reads a
`data-command` attribute, and it copes with a click that hit no button at all.

## ex8

Tests deferring a decision. A single tap cannot be reported straight away
because it might still become a double, so the first click starts a timer and
the second one cancels it - the classic mistake being to fire both, which is how
a double click deletes a row twice. The timer id belongs in a ref, since nothing
on screen depends on it, and the model answer also cancels a pending timer on
unmount, because a callback that outlives its component reports a tap on
something that is no longer there.

## Further reading

- [Responding to events](https://react.dev/learn/responding-to-events)
- [State as a snapshot](https://react.dev/learn/state-as-a-snapshot)
- [Queueing a series of state updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- [Referencing values with refs](https://react.dev/reference/react/useRef)
- [MDN: Event.preventDefault](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
- [MDN: Event.stopPropagation](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation)
- [MDN: KeyboardEvent.key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)
