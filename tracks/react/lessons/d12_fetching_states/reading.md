# Reading — react/d12_fetching_states

## Notes

One idea unites this set: a request is a little state machine, and every state
it can be in is a screen somebody has to see. Idle, in flight, failed, answered,
answered-with-nothing — five, not two. Almost every fetching bug in a real
codebase is a pair of these states that were collapsed into one boolean: a
spinner that also means "failed", an empty list that also means "loading", an
error that survives its own retry. The drills push you to keep the states
separate and to notice which of them the user is entitled to be told about out
loud, through `role="status"` and `role="alert"`. The one thing deliberately
left out is the race between two in-flight requests — that is the next set, and
none of these problems need the guard.

## ex1

Tests whether the pending state exists at all. The classic mistake is rendering
the data-shaped markup with empty values in it, which flashes a component full
of blanks and tells a screen-reader user nothing whatsoever. The model answer
uses `null` as the "no answer yet" value and returns early with a live region,
which also means the happy-path markup never has to defend itself against
missing data.

## ex2

Tests the rejection branch, which is the branch nobody writes until an interview
or an incident. The classic mistake is `.then(setState)` with no second
argument: the promise rejects, nothing catches it, the spinner runs forever and
the console gets an unhandled rejection. The second mistake is a boolean
`failed` flag that throws away the message the server took the trouble to send.
The model answer stores the message and renders it in an alert, and puts the
error branch *above* the loading branch so the two cannot both be true.

## ex3

Tests whether you can distinguish "the server answered, and the answer is
nothing" from "the server has not answered". The classic mistake is initialising
the results to `[]`, which makes those two states literally the same value —
after which no amount of branching can tell them apart. The model answer starts
at `null` and treats an empty array as a real, successful answer with its own
sentence naming the query.

## ex4

Tests re-fetching on demand, and the etiquette around it. The classic mistake is
leaving the refresh control enabled while a request is in flight, which lets an
impatient user queue five identical requests and guarantees a race. The second
is blanking the value while it refreshes, so the number the user was reading
disappears. The model answer keeps `loading` as its own piece of state, uses it
only for the disabled attribute, and re-runs the effect through a counter it can
bump.

## ex5

Tests the transition between states rather than the states themselves. The
classic mistake is a retry that leaves the previous error on screen, so for one
frame the user sees a failure notice sitting beside a fresh spinner and
reasonably concludes it failed again. The model answer clears the error and the
old result at the top of the effect body — the start of a request is the moment
everything belonging to the last one becomes invalid.

## ex6

Tests stale-while-revalidate, the pattern every data library implements and most
hand-rolled code does not. The classic mistake is deriving "loading" from "data
is null", which forces you to null the data to show a spinner and makes flicker
unavoidable. The model answer keeps the last good value and a separate busy
flag, and moves the "something is happening" signal into `aria-busy` on the
region, where it costs the reader nothing.

## ex7

Tests sequential, dependent requests. The classic mistake is firing both
requests in parallel because it looks faster, which cannot work when the second
call needs an id only the first response carries — in production this is the
request for `/customers/undefined/orders`. The second mistake is two independent
loading flags, which lets a half-loaded screen render. The model answer chains
inside `then`, returns one combined object, and gives both steps a single
rejection handler.

## ex8

Tests accumulating state across requests plus a failure in the middle of it. The
classic mistake is `setItems(result.items)`, which turns pagination into
"replace the list" — the same code works for a first page and is wrong from the
second onwards. The second is emptying the list when a page fails, throwing away
data that was never in question. The model answer appends with the updater form,
keeps the page number stable so the retry asks for the page that failed, and
lets `hasMore` from the server decide when the button disappears.

## Further reading

- [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
- [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Choosing the state structure](https://react.dev/learn/choosing-the-state-structure)
- [MDN: using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [MDN: ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
