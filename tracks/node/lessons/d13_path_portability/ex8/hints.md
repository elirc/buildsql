## Hint 1

Every path is decided on its own: grow its suffix one segment at a time and stop
at the first length no other path can produce. The answer for one path says
nothing about the answer for another — in the gate, one needs two segments and
its neighbour needs three.

## Hint 2

For a candidate of `take` segments, the question is whether any *other* path's
last `take` segments are the same string. Comparing the joined suffixes is
enough; you do not need a trie for a list this size, and reaching for one is how
this question runs out of interview time.

## Hint 3

Two edges to get right. A path with fewer than `take` segments has to compare as
its whole self rather than throwing or wrapping around — `slice(-take)` on a
short array quietly returns everything, which happens to be what you want, but
say so on purpose. And a path that is still ambiguous at full length needs a
last resort; deciding what that is (the whole path? a numbered suffix?) is left
to you, because the gate only feeds it distinct paths.
