## Hint 1
Three things have to happen on submit, in this order: work out what is wrong,
show it, and only then decide whether to call `onSubmit`. The stub already
calls `preventDefault` — keep that, or the browser tries to navigate.

## Hint 2
Write validation as a plain function that takes the two values and returns an
array of message strings. That keeps it testable in your head and out of the
JSX:

```tsx
function validate(email: string, password: string): string[] { … }
```

The two rules are: the email must contain an `@`, and the password must be at
least 8 characters. The exact wording of the messages is in the README and the
gate checks it.

## Hint 3
Store the returned array in state so the render can display it, and render the
error region only when the array is non-empty — remember the `0` trap from
lesson 04 and compare the length explicitly. The region needs `role="alert"`.
Then submit only when there is nothing to report; whether you call `onSubmit`
inside the same handler or guard around it is up to you.
