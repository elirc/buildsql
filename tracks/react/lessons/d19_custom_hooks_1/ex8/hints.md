## Hint 1

Count the places that write to `errors`: the initial state, and `reset`. Not
`setField` — so fixing a field leaves its complaint on screen for ever. You
could add a call there, and then remember to add one to every future action.

## Hint 2

The errors are a pure function of the values, and you have been handed that
function. Compute them instead of storing them, and `isValid` falls out of the
result rather than being a third copy of the same fact.

## Hint 3

Computing them on every render would call `validate` when nothing has changed,
which the gate checks. `useMemo`, keyed on the values and the validator, is the
whole of the answer — and while you are there, notice that `reset` should go
back to the form's original values rather than to whatever object the caller
happens to be passing this render.
