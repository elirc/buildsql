## Hint 1

`useDisclosure` currently describes the shape of the answer and holds none of
it — `open` is whatever it was told, and `toggle` does nothing. Extracting
behaviour into a hook means moving the `useState` and the handlers there, not
writing an empty version of them.

## Hint 2

Then have `FaqItem` use it instead of its own state. Nothing about the
component changes on screen — which is the point: the extraction is invisible
to the user and makes the behaviour reusable.

## Hint 3

There is a second, separate bug. A button that opens and closes something has
to say so with `aria-expanded`, or a screen reader announces a button that
apparently does nothing. `aria-controls` pointing at the panel's id is the
matching half.
