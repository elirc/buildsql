## Hint 1

The keys are the paths a client would use to reach the field:
`owner.address.postcode`. Build them literally - there is no helper, and none
is needed.

## Hint 2

Nest the checks the way the body nests. Check `body.Owner is null` first and
file `"owner"`; only in the `else` branch look at `owner.name` and
`owner.address`; only when the address is present look at its two fields. That
structure is what stops a missing `owner` producing four messages.

## Hint 3

The postcode is ex2's lesson again: `.Trim().ToUpperInvariant()` first, then
match `^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$`, then echo the normalised
form - the gate expects `EC1A 1BB` back from ` ec1a 1bb `.
