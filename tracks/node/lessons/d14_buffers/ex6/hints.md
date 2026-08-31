## Hint 1

The grammar is `data:[<mediatype>][;base64],<payload>`. Everything hangs off
finding the **first** comma: to its left is metadata, to its right is the
payload, and any later comma is payload.

## Hint 2

Three decisions, in order:

- does the metadata end with `;base64`? That marker is not part of the media
  type, so strip it before you report the type;
- is the media type empty? Then it is not empty — the spec's default is
  `text/plain;charset=US-ASCII`, so a client never has to guess;
- decode the payload accordingly: `Buffer.from(payload, "base64")` or
  `decodeURIComponent` followed by a utf8 encode.

Splitting the whole string on `,` with `String#split` is the version that
corrupts a payload containing a comma. Use `indexOf` and two slices.
