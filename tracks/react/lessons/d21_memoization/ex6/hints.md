## Hint 1

The frame is memoized, its title is a constant string, and it still renders on
every tick. List its props again — there are three, and the one that is easy to
forget is not written like a prop at all.

## Hint 2

`children` is an ordinary prop, and the JSX between the tags is an object that
`createElement` builds afresh on every render of the parent. `memo` compares it
with `Object.is` like anything else, and finds it different every time.

## Hint 3

So give it the same element twice. `useMemo` returning the JSX, keyed on
whatever that JSX actually reads, is the smallest change — and it is worth
noticing that this is a real limit of `memo` rather than a trick: wrapping a
component that takes children usually buys nothing on its own.
