## Hint 1

`writable.write(chunk)` returns a boolean, and almost every tutorial ignores
it. It means "there is still room": `false` says the stream's internal buffer
has passed its `highWaterMark` and you should stop writing until it tells you
otherwise.

The signal that it has caught up is the `"drain"` event. So the loop is:
write; if the answer was `false`, wait for `"drain"`; carry on.

## Hint 2

Waiting for an event inside an `async` function is exactly what
`events.once()` is for:

```ts
import { once } from "node:events";

await once(writable, "drain");
```

That returns a promise which resolves the next time the event fires - the
promise-flavoured version of what you built by hand in lesson 04 ex4.

Note what you are *not* doing: you are not calling `end()`. The caller owns
the lifetime of the stream; your job is only to get the chunks in.

## Hint 3

```ts
for (const chunk of chunks) {
  if (/* what condition? */) {
    await once(writable, "drain");
  }
}
```

The decision left to you is the condition, and the subtlety is that the write
itself has to happen whether or not you end up waiting - `write()` always
accepts the chunk; its return value is advice about the *next* one. If you
skip the write when the buffer is full you will lose data; if you ignore the
return value entirely, the gate's `maxBuffered` number will be roughly ten
times the highWaterMark and it will tell you so.
