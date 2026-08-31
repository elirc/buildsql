## Hint 1

Seven bits of number per byte, and the eighth bit means "there is another byte
after this one". Least significant group first — which looks backwards until you
realise it is what lets a reader stop without knowing the length in advance.

## Hint 2

Writing: take the low seven bits, shift the number down by seven, and set the
continuation bit on the byte you just produced **if there is anything left**.
The loop has to run at least once or zero encodes as an empty buffer, so
`do { ... } while (rest > 0)`.

Reading: accumulate `(byte & 0x7f) * scale` and multiply `scale` by 128 each
time. Use multiplication rather than `<<`: JavaScript's bitwise operators
truncate to 32 bits, so the fifth byte of a large varint silently contributes
zero. Returning `bytesRead` is not decoration — it is how the caller finds the
next field.
