## Hint 1

`dirty` is set to `true` in one place and to `false` in none. Type something,
then type it back — the field now holds exactly what it started with and still
claims to be edited, and Reset has the same problem.

## Hint 2

Stop storing it. "Edited" means "the value is not what it started as", which is
a comparison you can make while rendering, and a comparison cannot be forgotten
the way a setter can.
