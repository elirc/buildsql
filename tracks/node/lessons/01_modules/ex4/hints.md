## Hint 1

The first assertion in the gate runs before your function is ever called and
checks that *neither* formatter module has been evaluated. That single check
rules out the obvious solution: two `import` statements at the top of your
file would evaluate both modules the moment the gate imports yours.

What you need is the form of import that happens when control reaches it,
returns a promise, and is allowed to sit inside an `if` or a `switch`.

## Hint 2

`await import("./formatters/csv")` gives you the module namespace object - the
same thing `import * as csv from ...` would bind. The function you want to
return is its `default` property, because those modules use `export default`.

Branch on `kind` with a `switch` or an `if`, one `await import` per branch.
Write the specifiers as literal strings: a bundler can only prepare what it
can see, and `import(someVariable)` is the version that bites you later.

For an unknown kind, throw an `Error` whose message contains
`unknown formatter: ` followed by the kind you were given.

## Hint 3

The shape:

```ts
switch (kind) {
  case "csv": {
    const module = await import(/* the literal specifier */);
    return module./* which property? */;
  }
  // ... the json case ...
  default:
    throw new Error(`unknown formatter: ${kind}`);
}
```

Two decisions left: which property of the namespace object carries a default
export, and whether to keep the `default` branch at all. TypeScript says it is
unreachable, which is exactly why the gate calls it through a
`@ts-expect-error` - types are erased before your code runs, and the string
that arrives at run time is whatever the caller had.
