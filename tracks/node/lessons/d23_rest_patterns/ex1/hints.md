## Hint 1

Four verbs, four questions to answer for each: does it need the resource to
exist already, does it create one, what status says so, and does it owe a
`Location` header.

Write that table out before you write the routes. The code falls out of it.

## Hint 2

The two that trip people up:

**PUT is not "update".** It means "let this url hold this representation", so a
PUT to an id nobody has used creates it — and a creation is a 201 with a
`Location`, however it happened. A second PUT to the same id replaces, which is
a 200. `express` gives you `res.status(201).location(url).json(task)` in one
chain.

**Replace means replace.** If the incoming representation does not mention
`done`, the stored resource does not have it either — it goes back to its
default. A PUT that merges the fields it was given onto the ones it was not is a
PATCH with the wrong name on it, and the gate has an assertion for exactly that.
