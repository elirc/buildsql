## Hint 1

"Does this document contain this shape" is the containment operator from lesson 19 - the right side is a small JSONB document describing what you are looking for.

## Hint 2

payload @> '{"value": 1000}' matches every payload whose value key is exactly the number 1000. Extracting with ->> and casting to int works too - write whichever you did not think of first.
