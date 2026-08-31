## Hint 1
Four bare columns. The only decision is their sequence, and the prompt
made it for you.

## Hint 2
`hired_on` is a `date`, not a `timestamptz` - it comes back with no time
part, and that is correct. Do not cast it.
