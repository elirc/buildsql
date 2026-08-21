## Hint 1

The warm-up question. One pass, an accumulator object, and a decision about
what happens the first time a key is seen.

Say the signature out loud before you type it: a list of `T`, a function from
`T` to a string, and an object from those strings to lists of `T`.

## Hint 2

The first sighting of a key has no array yet, so create one:

```ts
if (!(k in groups)) {
  groups[k] = [];
}
groups[k].push(item);
```

`groups[k] ??= []` is the same thing in one line, and it is worth knowing that
logical assignment operators exist when someone is watching you type.

## Hint 3

Declare `const groups: Record<string, T[]> = {}`, loop the items, compute the
key once, create the array if it is missing, and push.

Left to you: whether the result should be an object or a `Map`. In an interview,
say why - a `Map` keeps non-string keys and insertion order, an object is easier
to serialise - and then pick one.
