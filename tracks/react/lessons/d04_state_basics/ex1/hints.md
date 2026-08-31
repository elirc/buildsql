## Hint 1
The stub keeps the count in an ordinary variable. Ask yourself what React knows
about that variable: nothing. Changing it changes no screen, because nothing
told React that this component now looks different.

## Hint 2
`useState` gives you a value and a setter, and calling the setter is what
schedules the next render. The disabled state is not a second piece of state -
it is a comparison between the count you already have and the `goal` prop, made
fresh on every render.
