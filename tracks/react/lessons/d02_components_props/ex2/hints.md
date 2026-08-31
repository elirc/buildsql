## Hint 1
Two independent problems. One prop has to become the image's accessible name;
another has to reach two attributes at once, and has a default when it is not
passed.

## Hint 2
`alt=""` is a promise that the image carries no information - it removes the
image from the accessibility tree, and with it the `img` role the gate queries.
A person's avatar is not decoration, so `alt` gets the name.
