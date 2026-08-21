## Hint 1

No `Transform` subclass here, no callbacks, no `push`. An async generator
consumes with `for await` and produces with `yield`, and Node's `pipeline`
accepts one as a stage - so this is the same job as ex1 with a tenth of the
ceremony.

The counter is a plain `let` in the function body, because a generator's body
runs once per invocation and keeps its local state between yields.

## Hint 2

The shape of every generator transform:

```ts
export async function* stage(source: AsyncIterable<unknown>): AsyncGenerator<string> {
  for await (const item of source) {
    yield /* something derived from item */;
  }
}
```

`yield` is the `push`. Where the generator suspends at a `yield`, it is
waiting for the consumer to ask for the next value - which means backpressure
is built in and you never have to think about it.

Note the item type is `unknown`: inside a byte-mode pipeline the values that
arrive are `Buffer`s, and in object mode they are whatever was pushed.
`String(item)` handles both, because a Buffer stringifies to its decoded text.

## Hint 3

Three lines inside the loop at most. The decisions left to you are where the
counter starts (the gate wants the first item to be `1: ...`, not `0: ...`)
and the exact separator - a colon and a single space.

If you find yourself reaching for `source.on("data")` or `push`, stop: the
whole point of this form is that neither exists. The generator *is* the
stream stage.
