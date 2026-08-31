# Reading - node/d14_buffers

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **staying in bytes until you have decided to leave
them**. A Buffer is a fixed-width sequence of octets; a JavaScript string is a
sequence of UTF-16 code units. Converting between them is a decision with two
costs: it is lossy in one direction (any byte that is not valid UTF-8 becomes
`U+FFFD` and never comes back) and it changes the length, which quietly
invalidates every offset you had computed. Six of these eight answers are the
same shape — find a boundary with `indexOf` or arithmetic, slice with
`subarray`, and decode only the range you know is text. The other two are about
knowing what the platform already ships: `base64url` is an encoding name, and
`StringDecoder` is the module that holds a half-arrived character for you.

## ex1 — the encoding has a name

**What it tested:** whether you look up the encoding list before you write a
transformation. base64url is not a variant you implement on top of base64; it is
a value `Buffer` has accepted since Node 14.

**The classic mistake:** the four-step hand roll —
`toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")` —
and then a decoder that has to compute the padding back from `length % 4`. That
padding arithmetic is where it breaks, and it breaks on one input in four, so
the bug reaches production with a passing test suite behind it.

**Model answer:** `buffer.toString("base64url")` and
`Buffer.from(text, "base64url")` — and the decoder is liberal for free, because
Node's base64 decoder accepts both alphabets and missing padding.

## ex2 — seven bits at a time, little end first

**What it tested:** a variable-length integer, which is the encoding underneath
Protocol Buffers, DWARF, WebAssembly and half the binary formats you will meet.
The point of it is that a small number costs one byte.

**The classic mistake:** two of them, and both are silent. A `while` loop with
the test at the top encodes `0` as an empty buffer, because the body never runs.
And `value |= (byte & 0x7f) << shift` truncates to 32 bits, so the fifth group
of seven bits contributes nothing at all and a large varint decodes to a
plausible smaller number.

**Model answer:** `do/while` for the write; multiply by a running `scale` rather
than shifting for the read; and return `bytesRead` so the caller can find the
next field, since a varint is almost never the only thing in the buffer.

## ex3 — the layout is the specification

**What it tested:** reading a fixed record with `readUInt32LE` / `readUInt16BE`
and friends, where the width **and** the byte order are part of the contract and
neither is guessable from the data.

**The classic mistake:** assuming one endianness for the whole structure. Mixed
layouts are ordinary — a format that stores its own fields little-endian and its
network identifiers big-endian is not being perverse, it is being two formats
that grew together. Reading `count` big-endian here gives 1880096512, a number
that looks like a number and passes straight through your validation. Second
mistake: leaving the NUL padding on the fixed-width name, producing a string
that prints correctly and compares equal to nothing.

**Model answer:** check the length before any read, check the magic before you
believe anything, then read each field at its offset in its declared order — and
strip the padding, because the field is fixed width and the value is not.

## ex4 — indexOf takes a Buffer

**What it tested:** that splitting is a byte operation with a byte engine.
`Buffer#indexOf` accepts a Buffer needle and a start offset, which is the entire
algorithm.

**The classic mistake:** `buffer.toString().split(delimiter).map(Buffer.from)`.
It works on ASCII and destroys everything else: the gate splits on `0xa9`, the
*second* byte of a two-byte character, which no string-level search can find
because by then those two bytes are one character. Close behind: dropping the
final piece when the buffer ends on a delimiter, which is how a blank line stops
terminating a header block.

**Model answer:** a cursor and `indexOf(delimiter, start)` in a loop, with the
tail pushed unconditionally after it — `subarray`, not `slice`-and-copy, because
staying in bytes is the point.

## ex5 — somebody already wrote this

**What it tested:** that "a character can be split across chunks" has a core
module devoted to it, and that you recognise the problem before you start
counting lead bytes.

**The classic mistake:** handling a one-byte remainder and calling it done. A
four-byte character can be split **three** times, so the hand-rolled version
passes every test until an emoji arrives at a chunk boundary. The other mistake
is dropping the held bytes at end of stream instead of reporting them: a
truncated sequence that vanishes is a bug nobody can see.

**Model answer:** `new StringDecoder("utf8")`, `write` for push and `end` for
end — the same object a Readable in string mode is already using underneath you.

## ex6 — the first comma is the boundary

**What it tested:** parsing a small grammar where the interesting decision (how
is the payload encoded?) is carried by a suffix on the metadata rather than by
the payload itself.

**The classic mistake:** `text.split(",")`, which corrupts any payload
containing a comma — and base64 payloads do not contain commas, so this passes
the test you wrote and fails on the percent-encoded JSON somebody inlines later.
Second: reporting the media type as `text/plain;base64`, leaving the encoding
marker inside the type, so every content-type comparison downstream misses.

**Model answer:** `indexOf(",")` and two slices; strip `;base64` from the
metadata before reporting it; substitute the spec's default when the type is
empty; and decode to a Buffer either way, because the payload is bytes even when
those bytes happen to be text.

## ex7 — the chunk boundary is not the frame boundary

**What it tested:** stateful reassembly. Lesson 06 handed you a complete buffer
and asked for the frames in it; the network does not do that, and the difference
between the two is the entire exercise.

**The classic mistake:** reading the length before checking that four bytes are
actually there — `readUInt32BE` on a two-byte buffer throws `ERR_OUT_OF_RANGE`
and takes the connection with it. Then: handling one frame per `push` instead of
looping, which works perfectly until traffic gets busy enough for two frames to
share a packet, at which point you drop every frame after the first and the
symptom is "messages go missing under load".

**Model answer:** concatenate onto the leftover, then loop with two separate
guards — enough bytes for the header, then enough bytes for the payload — and
copy each payload out, because a `subarray` is a view over a buffer that is
about to be replaced.

## ex8 — decode the head, keep the body

**What it tested:** the boundary decision itself. Half of this buffer is text
and half of it is not, and the whole job is to find the line between them
without decoding across it.

**The classic mistake:** `buffer.toString()` on the whole message, split on the
blank line, and `Buffer.from()` the second half back. Every byte that was not
valid UTF-8 is now a replacement character, the body is a different length than
it was, and the `content-length` you already sent is a lie. The other one is
`line.split(":")`, which turns `Location: https://example.com:8443/x` into a
header whose value is `https`.

**Model answer:** `indexOf` the CRLF CRLF as bytes, decode only `[0, at)`, keep
`[at + 4, end)` as a Buffer, and cut each header line at its **first** colon —
joining a repeated name with `", "` rather than letting the last one win.

## Further reading

- [Node.js: `Buffer`](https://nodejs.org/api/buffer.html) — the supported encoding names (including `base64url`), the `read*` family, and the difference between `subarray` and a copy.
- [Node.js: `buf.indexOf()`](https://nodejs.org/api/buffer.html#bufindexofvalue-byteoffset-encoding) — the byte search ex4, ex7 and ex8 are all built on.
- [Node.js: `node:string_decoder`](https://nodejs.org/api/string_decoder.html) — ex5, and what a Readable in string mode does for you already.
- [MDN: `data:` URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data) — the grammar of ex6, including the default media type.
- [MDN: UTF-8](https://developer.mozilla.org/en-US/docs/Glossary/UTF-8) — why a character can be one to four bytes, and what a lead byte looks like.
