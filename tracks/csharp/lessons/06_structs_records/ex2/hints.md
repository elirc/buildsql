## Hint 1

Four one-line bodies, and three of them are shorter than you expect. This
exercise is not about writing code — it is about seeing that a `record` and a
`class` with identical data answer the same question differently.

Do not "fix" the class. `ClassEqualsSays` must report what the class actually
says, even though the answer looks wrong.

## Hint 2

`SameReading` can be `a == b`, or `a.Equals(b)` — for a record both do value
comparison, which is exactly the point.

`SameLegacyData` compares the two properties by hand with `&&`.

`ClassEqualsSays` is `a.Equals(b)` and nothing else. `ReadingClass` overrides
nothing, so this is `object.Equals`, which is reference equality.

`Describe` is `reading.ToString()`.

## Hint 3

Predict the four results before you run the gate, then check yourself:

- two records with the same data — equal?
- two class instances with the same data, compared field by field — equal?
- the same two class instances, compared with `Equals` — equal?
- what does a record's `ToString` print?

The last one is worth guessing precisely; the format is
`TypeName { Property = value, Property = value }`, and getting the spaces right
matters to the gate. If you are unsure, print it once in `dotnet script` or
just read the gate's expected string.
