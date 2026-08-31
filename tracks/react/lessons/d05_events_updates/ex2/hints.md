## Hint 1
Every button needs to send a different value, and the only place that value is
known is the JSX that created the button. So each button needs its own handler,
built where the value is in scope.

## Hint 2
An arrow function in the prop is that handler: `onClick={() => onPress(2)}`
creates a function that, when React eventually calls it, calls yours with the
argument you closed over. Writing `onClick={onPress(2)}` calls it immediately
instead - the parentheses decide which.
