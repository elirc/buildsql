## Hint 1

`pages` is a generator: it hands back one chunk at a time instead of building
the whole list. `collect` is the opposite - it drains an async sequence into an
array, and it should work for *any* element type, not just this one.

The chunking rule is lesson 01's `splitEvery` with one difference in the
degenerate case; the README says which.

## Hint 2

An async generator is `async function*`, and it produces values with `yield`:

```ts
export async function* numbers(): AsyncGenerator<number> {
  yield 1;
  yield 2;
}
```

Consuming one uses `for await`:

```ts
for await (const value of source) { ... }
```

`collect` needs a type parameter so the array it returns holds the source's
element type, and `AsyncIterable<T>` is the widest thing you can ask for - every
async generator is one.

## Hint 3

`pages` returns early for a size below 1, then loops `i += size` yielding
`items.slice(i, i + size)`. `collect<T>(source: AsyncIterable<T>): Promise<T[]>`
pushes each value from a `for await` loop into a `T[]` and returns it.

Left to you: why `collect` takes `AsyncIterable<T>` rather than
`AsyncGenerator<T>`. Try the narrower one and think about which callers you have
just excluded - it is the same "ask for the weakest thing you need" rule from
lesson 01.
