## Hint 1

`path.parse()` and `path.format()` are inverses. Parse gives you `{ root, dir,
base, name, ext }`; format builds a path back out of the parts you hand it.

## Hint 2

`path.format()` has a precedence rule that catches everybody: if you give it
`base`, it ignores `name` and `ext` entirely. So

```ts
path.format({ ...path.parse(file), ext: ".md" }); // unchanged - base wins
```

does nothing at all. Pass `dir`, `name` and `ext` and leave `base` out.

Normalising the caller's `ext` (dot or no dot, empty or not) is a two-line
concern; do it before you format, not inside it.
