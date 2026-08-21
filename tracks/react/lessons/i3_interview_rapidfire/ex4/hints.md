## Hint 1
`Body` is memoized and re-renders anyway, so the shallow prop comparison must be
failing. Two props go in. One is a function that arrives from outside and never
changes. Look hard at the other one and ask what `Object.is` says about it
between two renders.

## Hint 2
`{ padding: 8 }` is an **object literal**, so a brand-new object is allocated
every time `Panel` renders. It has the same contents and a different identity,
and `memo` compares identity — so the comparison can never succeed, and you are
paying for it on every render.

## Hint 3
The value never varies, so the simplest fix is to stop building it inside the
render at all: hoist it to module scope, where it is created once. `useMemo`
with an empty dependency array would also work and is the tool to reach for when
the object *does* depend on something. Be ready for the follow-up: name three
other props that break memo the same way.
