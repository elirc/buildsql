## Hint 1
A React component is a function that returns markup. The markup is JSX, and
anything you want to *compute* inside it goes in curly braces. Everything
outside the braces is literal text — including the comma, the exclamation mark
and the full stop.

## Hint 2
The shape is:

```tsx
export function Greeting({ name }: { name: string }) {
  return <h1>… some literal text … {someExpression} … more literal text …</h1>;
}
```

`{ name }` on the left of the colon is destructuring: it pulls the `name`
property out of the props object React hands you.

## Hint 3
You need exactly one expression in braces, and it is just `name`. Everything
else in the heading is typed out. Watch the spacing on either side of the
braces — JSX keeps whitespace that sits on the same line as text, so
`Hello, {name} !` renders a space before the exclamation mark.
