# Reading — react/d18_context_reducer_apps

## Notes

Context and a reducer together are the smallest thing that deserves the word
"architecture" in a React app: one reducer that owns the rules, one provider
that publishes the state and the way to change it, and consumers that are
almost stupid. The reason it works is that it removes choices from the
consumers, and almost every bug in this set is a consumer that took one back —
a toggle that remembered whether it was on, a button that decided for itself
whether it should be enabled, a component that stored a total it could have
added up. The provider's other job is derivation: `canNext`, `canUndo`,
`indeterminate` and the basket total are all questions the state can answer, and
answering them once in the provider is what lets a button in one branch depend
on a field in another without either knowing the other exists. Everything else
here is the machinery from the two previous sets showing up in a real shape:
lazy initialisers, stable dispatch, split contexts, and ids that have to stay
unique for longer than the list is long.

## ex1

Tests identity in a list that shrinks. The classic mistake is deriving an id
from `toasts.length`, which is the same as "how many have ever existed" only
until the first dismissal — after that the next toast collides with one already
on screen, and dismissing either takes both. The model answer keeps a counter in
the reducer's state, because "which numbers have been handed out" is a fact
about the list that no other field records, and only the reducer may advance it.

## ex2

Tests single source of truth. The classic mistake is a consumer that keeps its
own `useState` mirror of something the provider already knows: it works
perfectly until the same item appears twice, at which point the two copies
disagree and the count drifts away from the buttons. The model answer derives
the label from the shared list with `items.includes(item)`, which makes
disagreement unrepresentable.

## ex3

Tests deriving a guard in the provider. The classic mistake is a `Next` button
that only knows about the step number, because the email lives in a different
branch of the tree and passing it across would mean prop-drilling; the result is
a wizard that walks to a confirmation page with nothing to confirm. The model
answer computes `canNext` from the whole state where the whole state is, and
puts the same check inside the reducer — a disabled button is a courtesy, the
reducer is the guarantee.

## ex4

Tests the third state of a checkbox. The classic mistake is treating selection
as a boolean, so "some rows" renders as "no rows" and the user cannot tell a
fresh table from a half-selected one. `indeterminate` is a property of the DOM
node with no JSX attribute, so the model answer reaches for a ref and an effect
keyed on whether the selection is partial — and derives `all` and `some` rather
than storing them.

## ex5

Tests modelling a request as states. The classic mistakes are dispatching only
on success — so the moment the button is pressed is invisible and the user
presses it again — and having no failure branch at all, which leaves a disabled
button and a spinner for ever. The model answer dispatches three times for one
request, and types the state as a union so that "pending and also failed" cannot
be written down, let alone rendered.

## ex6

Tests the two ends of persistence. The classic mistakes are reading the store as
an ordinary expression in the provider's body, which runs on every render, and
writing from an effect with no guard, which saves the draft it has just loaded
every time the app opens. The model answer uses `useReducer`'s initialiser
argument for the read and a ref flag for the write, so the first run of the
effect is recognised and skipped.

## ex7

Tests deriving affordances from history. The classic mistake is offering `Undo`
and `Redo` unconditionally: a button that does nothing is worse than no button,
and a reducer that undoes an empty past sets `present` to `undefined` and takes
the app down. The model answer derives both flags from the two stacks in the
provider, guards both cases in the reducer, and clears `future` whenever a new
note is added — the redo branch is not reachable once you have gone somewhere
else.

## ex8

Tests everything at once. Three separate ideas have to be right: quantities are
one operation with a different sign, a line at zero is a line that no longer
exists, and the total is derived rather than stored. The one that catches people
is the render count — reading a context is a subscription, so a value bundling
`{ lines, dispatch }` subscribes the Add buttons to the basket even though they
only ever dispatch. The model answer publishes the lines and the dispatch as two
contexts, which costs nothing because `dispatch` is guaranteed stable and its
context value therefore never changes at all.

## Further reading

- [Scaling up with reducer and context](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [`useReducer` reference](https://react.dev/reference/react/useReducer)
- [`useContext` reference](https://react.dev/reference/react/useContext)
- [Choosing the state structure](https://react.dev/learn/choosing-the-state-structure)
- [MDN: the checkbox `indeterminate` property](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/indeterminate)
- [WAI-ARIA Authoring Practices: checkbox with three states](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)
