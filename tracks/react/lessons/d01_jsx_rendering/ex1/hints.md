## Hint 1
Everything between `{` and `}` in JSX is a JavaScript expression, evaluated
once per render. The price is not a prop you were given; it is a value you
compute from `cents` at the moment you render it.

## Hint 2
Two decimal places is `toFixed(2)`, which returns a string. Watch the literal
text around the braces: the dash, the spaces and the dollar sign are ordinary
JSX text, and JSX keeps the spaces you type on a single line.
