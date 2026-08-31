## Hint 1
Three elements, nested: the one that groups a picture with its caption, the
picture itself, and the caption. HTML already has all three, and the grouping
one is what gives the gate a `figure` role to find.

## Hint 2
`alt` is not decoration - it is the image's accessible name, which is how
`getByRole("img", { name })` finds it at all. An image with `alt=""` is
deliberately invisible to a screen reader, and that is the wrong claim here
because this picture carries information.
