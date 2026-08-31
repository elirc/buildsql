## Hint 1
A prop the caller did not pass arrives as `undefined`. You need somewhere for
the fallback to live, and JavaScript already has a place for it in the
parameter list itself.

## Hint 2
Default values go in the destructuring pattern: `{ name, salutation = "Hello" }`.
Keep the question mark on the type - optional to the caller, always a string
inside the component.
