## Hint 1

A call signature inside an interface has no name and no `function` keyword:

```ts
export interface Scorer {
  (white: number, black: number): string;
  label: string;
  total: number;
}
```

That describes an object that happens to be callable - which every JavaScript
function already is.

## Hint 2

`Object.assign(fn, { label, total: 0 })` attaches the two members to the
function and hands back something that satisfies the whole interface.

The counter has to live on the returned object itself, so the arrow function
increments `scorer.total` through the closure - which is why the `const` is
declared with its type before the assignment rather than after.

Left to you: `Object.assign`, or a cast plus two assignments. Both are honest;
one of them survives someone adding a third member.
