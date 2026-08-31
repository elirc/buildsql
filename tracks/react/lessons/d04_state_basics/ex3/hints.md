## Hint 1
Read the stub out loud: "call makeInitial, then pass the result to useState".
That call happens every time the component renders, and React throws the result
away on every render after the first.

## Hint 2
`useState` accepts either a value or a function that produces one. Give it the
function itself and React calls it exactly once, on mount - the difference is a
pair of parentheses.

## Hint 3
The Append button has the same shape of choice: `setDraft(draft + "!")` reads
the draft that belonged to the render the click came from, while the updater
form reads the value React holds when the update is applied. Only one of those
is safe when two clicks land in the same batch - decide which, and say why.
