## Hint 1

`never` is the right type for the half that is not there. `ok(1)` cannot
produce an error, so its error type is `never` - and `Result<number, never>` is
still assignable to `Result<number, string>`, because `never` is assignable to
everything.

## Hint 2

`unwrapOr` narrows on `result.ok`. The two gate cases with `0` and `undefined`
are there to catch `result.value ?? fallback` and `result.value || fallback`,
both of which look shorter and are wrong.

Left to you: whether `unwrapOr`'s fallback should be `T` or a wider type. The
prompt says `T`; widening it changes the return type and is a defensible
different function.
