## Hint 1

The gate wants one exact sentence back, with the name dropped into the middle
of it. Everything except the name is fixed text — so the question is only
"how do I build a string out of a fixed part and a variable part?".

Look at the two expected outputs side by side and write down, on paper, the
characters they have in common. That is your template.

## Hint 2

C# gives you several ways: `+` concatenation, `string.Format`,
`StringBuilder`, and interpolation. Reach for interpolation — a `$` in front
of the string literal, and `{ }` around the expression you want inserted. The
README's Concept section has the form.

Your body is one `return` statement, replacing the `throw`. If you have
written more than one line, you are solving a bigger problem than this one.

## Hint 3

The shape is:

```csharp
return $"Hello, {/* the parameter */}! Welcome to the dojo.";
```

Fill in the interpolation and check the punctuation character by character
against the README: comma after `Hello`, exclamation mark after the name,
single space, and a full stop at the very end. If your output comes back with
literal braces in it, you left off the `$`.
