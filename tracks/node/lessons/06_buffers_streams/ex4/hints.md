## Hint 1

The mirror image of ex3. A `Writable` has one method to implement, `_write`,
supplied as the `write` option:

```ts
new Writable({
  write(chunk, encoding, callback) {
    // store the chunk, then tell the stream you are ready for the next one
  },
});
```

The array of chunks lives in the closure, exactly like the counter did, so
both the stream and `text()` can see it.

## Hint 2

The `callback` argument is the whole protocol of a writable stream. Calling it
means "I am done with this chunk, send me another". Calling it with an error
(`callback(error)`) fails the stream. **Not** calling it stalls the pipeline
forever, which is the classic bug in a hand-written Writable - your test hangs
and nothing tells you why.

Store the bytes, not a decoded string, for the same reason as ex2: a chunk
boundary can land in the middle of a character. Decode once, in `text()`.

## Hint 3

```ts
const chunks: Buffer[] = [];

const writable = new Writable({
  write(chunk: Buffer, _encoding, callback) {
    chunks.push(/* ? */);
    /* and then? */
  },
});

return { writable, text: () => /* ? */ };
```

Three small decisions, and the second one is the one that hangs the gate if
you forget it. `text()` is deliberately a function rather than a property, so
it can be called at any point and report what has arrived so far - a property
would be evaluated once, at creation, when nothing has arrived at all.
