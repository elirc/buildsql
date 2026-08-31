## Hint 1

The clamping in `next` is right and it is not enough: it stops the reader
walking past the end, but nothing stops the end walking back past the reader.
When the list shrinks, the page in state is simply out of range.

## Hint 2

Separate the page that was asked for from the page that is shown. Keep the
first in state, work the second out during render as the smaller of the two,
and slice with that.

## Hint 3

Doing the correction in an effect instead would work eventually, and would
first commit a render showing an empty page — deriving it during render means
there is no such frame.

One detail falls out of that split: `next` and `prev` should move from the page
the reader can *see*, not from the number in state, or the first step back
after a clamp is spent undoing a move nobody ever saw.
