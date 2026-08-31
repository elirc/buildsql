## Hint 1

`buffer.toString(encoding)` and `Buffer.from(text, encoding)` take an encoding
*name*, and the list of names Node accepts is longer than `utf8`, `hex` and
`base64`. Read it before you write a single `replace()`.

## Hint 2

The hand-rolled version is four calls — encode, replace `+`, replace `/`, strip
`=` — and then the decoder needs the padding computed back from
`text.length % 4`, which is the line everybody gets wrong. The platform has one
name that does all of it, in both directions, and its decoder already accepts
the ordinary alphabet as well.

The only thing left to decide is what `fromBase64Url` should do with a string
that is not valid base64 at all. Node will not tell you; it decodes what it can.
