## Hint 1
Containment against a document whose `tags` is a one-element array:
the README's concept block shows the exact literal shape.

## Hint 2
`WHERE attributes @> '{"tags": ["eco"]}'` — note it's a normal quoted
string that happens to contain JSON.
