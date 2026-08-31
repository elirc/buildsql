## Hint 1

`Exclude<Union, Members>` keeps everything that is not in `Members`;
`Extract<Union, Members>` keeps everything that is. They distribute over the
union member by member, which is why they read like set difference and
intersection.

Derive both - writing `"draft" | "open" | "paused"` out by hand compiles and
stops matching the day a sixth status appears.

## Hint 2

`isLive` has to be a type **predicate** (`status is Live`), not a boolean.
That is what makes the `else` branch a `Dead` and what lets
`statuses.filter(isLive)` return `Live[]` with no cast at all.

Left to you: whether the dead statuses should live in a shared `as const` list
that both the type and the predicate read. It removes the duplication and costs
you a `readonly` cast - say which you would ship.
