## Hint 1

The question is whether a string appears as an element of the `tags` array -
not whether it appears anywhere in the document's text.

## Hint 2

`attributes->'tags' ? 'premium'` asks the array directly. The containment
form, `attributes @> '{"tags": ["premium"]}'`, asks the whole document and
is the version a GIN index can serve.
