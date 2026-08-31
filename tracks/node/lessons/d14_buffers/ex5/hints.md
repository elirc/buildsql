## Hint 1

Node ships the answer as a core module. It is the thing a Readable in string
mode uses internally, and its two methods are exactly the two methods this
interface asks for. Look for it in the module list before you start counting
lead bytes.

## Hint 2

The module is `node:string_decoder`; the class is `StringDecoder`; the methods
are `write(chunk)` and `end()`.

Writing it by hand means recognising a lead byte (`0b110xxxxx` is two bytes,
`0b1110xxxx` three, `0b11110xxx` four), holding the tail, and remembering that a
four-byte character can be split **three** times — which is why the hand-rolled
version that only handles a one-byte remainder passes every test until an emoji
arrives.

What `end()` should do with a sequence that can never be completed is a real
decision. The platform picks the replacement character; a stricter caller might
want an error.
