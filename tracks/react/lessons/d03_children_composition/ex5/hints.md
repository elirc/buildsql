## Hint 1
Two exports, but only one of them renders a `<button>`. The other is a
component that renders the first one with one decision already taken, and
forwards everything else it was given.

## Hint 2
The warning is text inside the button, which is why it changes the accessible
name. Add it in `Button`, driven by the tone, and `DangerButton` gets it for
free - that is the whole argument for specialisation over copying.
