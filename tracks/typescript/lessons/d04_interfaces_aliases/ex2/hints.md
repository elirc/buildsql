## Hint 1

`&` composes two object types into one that has every member of both. It is not
a union and nothing about it is optional - a `GameRecord` needs all four
members.

## Hint 2

The body is one spread into a fresh object literal. Resist `Object.assign(game,
{ createdAt })`: it returns the right type and writes the timestamp into the
caller's game on the way, which the gate checks for.

Left to you: `{ ...game, createdAt }` or naming every member by hand. The spread
keeps working when `Game` grows a member; the explicit version does not.
