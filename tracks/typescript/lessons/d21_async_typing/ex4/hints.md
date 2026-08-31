## Hint 1

`AsyncGenerator<T, TReturn, TNext>` has three type parameters and only the
first one matters here: `T` is what `yield` produces. The other two are `void`
and `undefined` for a generator nobody sends values into.

## Hint 2

The loop is "fetch, yield each item, stop or advance". Stopping on
`next === null` *after* yielding the page's items is what makes the last page
count.

`collect` is a `for await...of` and a push - and it takes `AsyncIterable<T>`
rather than the generator type, so it works on anything iterable
asynchronously.

Left to you: `while (true)` or `for (;;)`. Identical; pick the one your linter
does not argue with.
