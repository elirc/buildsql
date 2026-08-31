## Hint 1

`hidden` is a display decision made after the work is done: React has already
called the body component, built its elements and put them in the DOM. On a
real page that is also every effect inside it, which usually means every
request it makes.

## Hint 2

The cheapest render is the one that never happens. Conditional rendering — the
`&&` you have used since the conditional-UI drills — means a closed row builds
nothing, and opening it mounts the body for the first time.
