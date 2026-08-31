## Hint 1

`req.query` is a bag of strings — `?limit=5` gives you `"5"`, never `5`. A plain
`z.number()` therefore rejects every request you will ever receive. The schema
you want announces the conversion: `z.coerce.number()`.

## Hint 2

Order the modifiers deliberately. `z.coerce.number().int().positive().max(50)`
converts first and then constrains what it converted, so `abc` fails as a bad
number and `-1` fails as a bad range — two different codes, which is exactly
what the client needs to tell them apart.

`.default(...)` goes last and short-circuits: an absent parameter never reaches
the coercion at all. That is what removes every `?? 10` from the handler below.

One trap worth naming: `result.error.issues` is the whole list. Mapping only
`issues[0]` is what makes a client fix its query one parameter per round trip.
