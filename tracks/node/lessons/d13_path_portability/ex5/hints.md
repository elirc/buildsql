## Hint 1

Two separate jobs, in this order: decide whether the link names a local file at
all, and only then turn it into a path. The rejections are all prefix tests —
a scheme (`https:`, `mailto:`), a leading `//`, a leading `/`, a leading `#`.

## Hint 2

A link is relative to the **directory** the document sits in, so
`path.dirname(fromFile)` is where the resolve starts from. Everything after a
`#` or a `?` belongs to the browser, not to the filesystem, so strip it before
you resolve.

And a link is percent-encoded while a filename is not: `my%20diagram.png` is a
file with a space in it. `decodeURIComponent` is the one-liner, and the decision
left to you is what to do when it throws on a malformed escape.
