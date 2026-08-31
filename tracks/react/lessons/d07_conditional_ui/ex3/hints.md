## Hint 1
The gate checks the container is completely empty - not that it looks empty.
A wrapper with nothing inside it is still an element in the DOM, and it can
still carry margins, borders and a gap in the layout.

## Hint 2
`return null` from a component and React renders nothing for it at all. Decide
that at the top of the function, before any markup, and the rest of the
component only ever deals with the case where there is something to say.
