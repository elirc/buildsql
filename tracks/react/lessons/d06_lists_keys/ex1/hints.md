## Hint 1
Two decisions, both small. Which list element says that the order carries
meaning, and what does React need from every element that comes out of a
`map` so it can match this render against the next one.

## Hint 2
Steps happen in sequence, so the list is ordered. For the key, look for
something on the item itself that is stable and unique - a value the item will
still have on the next render, not the position it happened to be in.
