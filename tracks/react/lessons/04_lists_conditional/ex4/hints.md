## Hint 1
Three transformations, in a fixed order: sort, then take the first three, then
render. Do them above the `return` where you can read them, not inside the JSX.
And note the gate checks the props array afterwards — so at least one of these
steps has to leave the original alone.

## Hint 2
`sort` mutates the array it is called on and returns the same array, so
`players.sort(...)` reorders data owned by the caller. `[...players].sort(...)`
sorts a copy. `slice(0, 3)` already returns a new array, so it is safe as-is.

The comparator returns a negative number, zero, or a positive number:

```tsx
.sort((a, b) => /* … */)
```

## Hint 3
Two keys to compare on, and the second only matters when the first ties.
`b.score - a.score` gives you highest-first. When that is `0`, fall through to
comparing names — `||` is a neat way to chain comparators, since `0` is falsy.
`localeCompare` gives you an alphabetical comparison; deciding whether plain
`<` would have been good enough here is left to you.
