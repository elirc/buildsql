## Hint 1

Fix the return type to `Config` first; the body then has to earn it.

The order in the README is the order the gate checks. An empty object fails on
`host`, not on `port` - so each check has to come before the next one reads
anything.

## Hint 2

Narrow once to `Record<string, unknown>` after the object check, and every
member read after that is legal and still `unknown`.

Each field then needs a `typeof` and a domain rule: non-blank for the host, and
`Number.isInteger(port) && port >= 1` for the port (which also rejects `NaN`).

Build the result from the three values you proved rather than spreading `raw` -
the gate hands you an extra member to check that.

Left to you: four early `throw`s, or a small helper per field. Four throws is
the version you can write under time pressure.
