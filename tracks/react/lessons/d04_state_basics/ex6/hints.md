## Hint 1
Three switches, one object, and a Revert button that restores the object the
component started with. That last button is the whole test: it can only work if
nothing ever edited the starting object.

## Hint 2
A spread copies one level. `{ ...settings }` gives you a new outer object whose
`channels` is still the very same inner object - so a change made through it is
visible everywhere that inner object is reachable from, including the constant
you meant to keep pristine.

## Hint 3
Copy every level you are changing and no more: a new outer object, a new
`channels` object, the untouched values carried across. A computed key
(`[channel]: ...`) lets one function serve both channels - decide whether the
quiet-hours switch is worth a second function or belongs in the same one.
