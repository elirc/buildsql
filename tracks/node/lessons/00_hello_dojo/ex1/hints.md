## Hint 1

Nothing is passed in, so every piece of the answer has to come from somewhere
global. Node gives you exactly one such object for "facts about this process",
and the README names it twice.

Write down the target string by hand first — `Node.js v22.16.0 on win32` —
and mark which parts are fixed text and which parts are values.

## Hint 2

The two values you need are `process.version` and `process.platform`. Read
them as they are: `process.version` already carries its leading `v`, and
`process.platform` is a short lowercase id (`win32`, `darwin`, `linux`), not a
pretty name.

Build the string with a template literal — backticks and `${...}` — in a
single `return`.

## Hint 3

The shape is:

```ts
return `Node.js ${/* which property? */} on ${/* which property? */}`;
```

Two decisions left: which property goes in each slot, and whether you need to
touch either value on the way through. If your string comes out with `vv` at
the front, you added something that was already there.
