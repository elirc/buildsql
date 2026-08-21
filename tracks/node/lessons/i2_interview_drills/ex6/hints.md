## Hint 1

State the problem back: a match can straddle a chunk boundary, so you cannot
decide about the tail of a chunk until you have seen the next one.

The rule that falls out: after replacing what you can, hold back the last
`secret.length - 1` characters and emit everything before them. Those held
characters are the only ones that could still turn out to be the beginning of
a match.

## Hint 2

Per chunk: append the new text to what you held back, replace every occurrence
of the secret, then split the result into "safe to emit" and "hold back".

```ts
pending = (pending + text).split(secret).join("[REDACTED]");
const keepBack = secret.length - 1;
```

`split(secret).join(replacement)` replaces every occurrence without needing a
regular expression - which matters, because a secret can contain characters
that mean something in a regex.

And decode with `StringDecoder`, not `chunk.toString()`: a multi-byte
character split across chunks would otherwise be corrupted before you ever
looked for the secret.

## Hint 3

```ts
if (pending.length > keepBack) {
  const safe = pending.slice(0, pending.length - keepBack);
  pending = /* what is left */;
  this.push(safe);
}
callback();
```

Two decisions left: the remainder after the slice, and what `flush` does. The
gate feeds an input whose last characters are the tail of a secret, so the
final replacement can only happen in `flush` - and whatever is still held back
at the end has to be emitted there or it silently disappears.

One honest caveat worth saying out loud: this holds back a fixed number of
characters, which is correct for a literal secret. Redacting a *pattern* (a
regex for card numbers, say) has no such bound and needs a different strategy.
