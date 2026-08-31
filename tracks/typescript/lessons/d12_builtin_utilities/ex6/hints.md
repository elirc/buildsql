## Hint 1

`ReturnType<typeof fetchPosting>` is `Promise<{ id, title }>` - the type of what
the call gives you, not the type of what you hold after awaiting it.

`Awaited<T>` unwraps that, recursively, so `Fetched` is the plain object.

## Hint 2

`ids.map((id) => fetchPosting(id))` gives you an array of promises.
`Promise.all` turns that into a promise of an array, which is what the return
type asks for.

Left to you: `Promise.all` or a sequential `for await`. The first is one line
and fails fast on the first rejection; the second is slower and gives you a
place to keep going. Say which the caller would want.
