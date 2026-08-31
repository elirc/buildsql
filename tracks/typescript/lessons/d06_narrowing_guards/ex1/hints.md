## Hint 1

The return type is the exercise: `value is string` instead of `boolean`. Both
return `true` or `false` at runtime; only one of them narrows for the caller,
and the type gate checks exactly that.

## Hint 2

The body is a single `&&`. The `typeof` check has to come first, because
`.trim()` cannot be called on an `unknown` - and because `&&` short-circuits,
the second half only runs once the first has proved the type.

Left to you: `value.trim() !== ""` or `value.trim().length > 0`. Identical
here; one of them reads like the sentence in the prompt.
