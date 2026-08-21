## Hint 1

Two lines of real content: iterate the source with `for await`, and write each
chunk. The whole exercise is the boolean `write()` returns.

`false` means the sink has more queued than its `highWaterMark` allows. It
still accepted your chunk - the boolean is advice about the *next* one - so
what you do is stop writing until the sink says it has caught up.

## Hint 2

The catching-up signal is the `"drain"` event, and the promise-flavoured way
to wait for one event is `events.once`:

```ts
import { once } from "node:events";

if (!dest.write(chunk)) {
  await once(dest, "drain");
}
```

Do not call `dest.end()` - the caller owns the stream lifetime and the gate
ends it itself.

## Hint 3

```ts
for await (const chunk of source) {
  written += 1;
  if (/* what condition? */) await once(dest, "drain");
}
return written;
```

The decision left to you is that condition, and the trap is writing the chunk
inside the `if` - `write()` must happen for every chunk, and its return value
is what you branch on. If the gate reports a `maxBuffered` around 150 against
a highWaterMark of 16, you wrote everything without ever waiting.
