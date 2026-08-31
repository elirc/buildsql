## Hint 1

A mapped type's key set does not have to be `keyof` something - any union of
keys works. Map over `K` itself, not over `keyof K`.

## Hint 2

`{ [P in K]: V }` demands exactly the keys in `K`. Compare that with the stub's
index signature, which accepts any string key and requires none - that is why
`{ up: 1 }` slipped past it with `down` missing.
