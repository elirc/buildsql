## Hint 1
Two readers, two versions of the same fact. Sighted readers get a row of
characters; a screen-reader user needs the sentence, and needs *not* to hear
the characters as well.

## Hint 2
`role="img"` on a plain element says "treat this as one picture", and
`aria-label` becomes its name - so the label must be the whole sentence, built
from both props. Empty stars are a `repeat` of the difference.

## Hint 3
An element with `aria-hidden="true"` stays visible on screen and disappears
from the accessibility tree. Decide which of your two elements carries it, and
check that the visible characters still end up inside the element the gate
finds by role.
