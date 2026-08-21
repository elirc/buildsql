## Hint 1

The gate wants one exact sentence back, with the name dropped into the middle
of it. Everything except the name is fixed text — so the question is only
"how do I build a string out of a fixed part and a variable part?".

Look at the two expected outputs side by side and write down, on paper, the
characters they have in common. That is your template.

## Hint 2

JavaScript gives you three ways to do this: `+` concatenation, `.concat()`,
and template literals. Reach for the template literal — backticks, with
`${...}` around the expression you want interpolated. The README's Concept
section has the form.

Your body is one `return` statement. If you have written more than one line,
you are solving a bigger problem than this one.

## Hint 3

The shape is:

```ts
return `Hello, ${/* the parameter */}! Welcome to the dojo.`;
```

Fill in the interpolation and check the punctuation character by character
against the README: comma after `Hello`, exclamation mark after the name,
single space, and a full stop at the very end. Do not touch the signature —
`(name: string): string` is what the type gate is checking for.
