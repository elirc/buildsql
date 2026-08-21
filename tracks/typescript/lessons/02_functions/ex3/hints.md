## Hint 1

The gate's callback wants two things - the name and the position it came from.
The stub's callback type only offers one. Fixing the type is the first half;
actually passing the second argument is the second half, and the gate checks
both.

## Hint 2

A function type in a parameter position looks like an arrow with no body:

```ts
(item: string, index: number) => void
```

`void` as a *return* type means "I am not going to use whatever you return".
That is not the same as `undefined`: a callback typed `=> void` may return
anything at all, and the caller simply ignores it. That rule is why the gate
can pass `(name) => collected.push(name)`, even though `push` returns a number.

## Hint 3

Widen the callback type to `(name: string, index: number) => void`, then walk
`names` with an indexed `for` loop and call `visit(names[i], i)`. The function
itself returns nothing, so its own return type stays `void`.

Left to you: an indexed `for`, or `names.forEach(visit)`. The second is
shorter, and it also hands your callback a third argument you did not ask for.
Decide whether you care.
