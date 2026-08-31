## Hint 1

Ask which parts of the tree the `showHelp` flag actually decides. It decides
one paragraph and one button label — and it is stored in a component that also
renders the report, so a render caused by it reaches the report too.

## Hint 2

Move the state down: the smallest component that needs a piece of state should
be the one that holds it. Extract the button and its paragraph into a component
of their own, and `HelpPanel` is left with no state and no reason to re-render.
