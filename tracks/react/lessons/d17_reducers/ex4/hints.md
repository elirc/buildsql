## Hint 1

`useReducer` keeps only the first initial state it is given, but the expression
you pass as that argument runs on every render regardless — React never gets a
say in whether it is evaluated.

## Hint 2

`useReducer` takes an optional third argument for exactly this: the value to
start from, and a function to turn it into state. React calls that function
once. Note that the same idea has a `useState` spelling — passing the function
itself rather than calling it.
