## Hint 1

Two unions to pin: three states (`"closed"`, `"open"`, `"locked"`) and four
events (`"open"`, `"close"`, `"lock"`, `"unlock"`). Note that `lock` and
`unlock` have the same payload and are still separate variants - the tag is what
tells them apart.

## Hint 2

Switch on the state first: the legal moves are grouped by state, and each branch
only has to recognise one or two events. Every branch ends with `return state`
for everything it does not recognise.

`return state` and not `return { ...state }` - the gate compares with identity,
because a new object that means nothing new is what causes a spurious re-render.

Left to you: state-outer/event-inner, or the other way round. One of them makes
the illegal-move default a single line per state.
