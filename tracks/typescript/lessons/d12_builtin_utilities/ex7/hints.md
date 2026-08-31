## Hint 1

`typeof Search` is the type of the **class**; `ConstructorParameters<typeof
Search>` is the tuple `new` takes, and `InstanceType<typeof Search>` is what
`new` produces - which is `Search` itself, and the type gate says so.

`Parameters<typeof Search>` is a different thing and does not apply to a class.

## Hint 2

`makeSearch` is `new Search(...args)`.

`run` lower-cases the term once outside the loop, filters with `includes`, and
`slice(0, this.limit)` caps the result - `slice` already handles a limit larger
than the list, so no branch is needed.

Left to you: whether `limit` should be validated. Nothing stops a caller passing
`-1`, and `slice(0, -1)` does something surprising - decide whether you care.
