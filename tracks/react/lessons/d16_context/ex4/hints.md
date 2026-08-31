## Hint 1

Reading a context is a subscription: when its value changes, every component
that read it re-renders. `VolumeButtons` reads a value that contains the
volume, so it is subscribed to the volume — even though it never displays it.

## Hint 2

Two audiences want two different things, so publish two things. One context for
the number, one for the pair of functions, both provided by the same component.

## Hint 3

Splitting alone is not enough: the actions context has to hand out the *same*
object every time, or its consumers are back where they started. Write the two
functions so they never need to know the current volume, and the object can be
built once and kept.
