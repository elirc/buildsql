## Hint 1

A `Readable` is an async iterable, so the loop you want is `for await (const
chunk of source)`. That form handles the `data`, `end` and `error` events for
you and propagates a stream error as a rejection - which is why it has almost
entirely replaced hand-wired `.on("data")` listeners in modern code.

The other half of the exercise is what you do with the chunks, and the gate is
built to catch exactly one wrong answer.

## Hint 2

The wrong answer is to decode each chunk to a string as it arrives and
concatenate the strings. UTF-8 is a variable-length encoding: `é` is two
bytes. If a chunk boundary falls between those two bytes, each half decodes to
a replacement character and the text is corrupt - permanently, because you
threw the bytes away.

So collect `Buffer`s in an array and let `Buffer.concat(chunks)` join them.
Decoding, if it happens at all, happens once at the end when every byte is
present.

## Hint 3

```ts
const chunks: Buffer[] = [];
for await (const chunk of source) {
  chunks.push(/* what, exactly? */);
}
return Buffer.concat(chunks);
```

The decision left to you is the push. Async iteration types the chunk as
`any`, so nothing warns you if a string sneaks in - `Buffer.from(chunk)` makes
the intent explicit and works either way. Check the empty-stream case in your
head: `Buffer.concat([])` gives you a zero-length Buffer, which is exactly
what the gate wants.
