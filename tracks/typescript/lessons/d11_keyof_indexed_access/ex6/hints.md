## Hint 1

Three fixes before any logic. `as const` on the table, `Role = keyof typeof
ROLES` for the names, and `RoleLevel = (typeof ROLES)[Role]` for the values -
that last one is an indexed access on the *type of a value*, which is the idea
this exercise exists for.

## Hint 2

`roleFor` scans the table looking for the matching level. `Object.keys` is
typed `string[]`, so one cast to `Role[]` is the accepted answer.

`atLeastRole` needs no scan at all - two lookups and a comparison, because the
numbers already encode the ordering.

Left to you: what `roleFor` should do if the loop ever finishes. The types say
it cannot; every function still needs a final `return`.
