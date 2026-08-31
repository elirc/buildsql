## Hint 1

One column is a text field of the document; the other is the length of an
array inside it. Two different operators, plus one function.

## Hint 2

`attributes->>'size'` for the text, and `jsonb_array_length(attributes->'tags')`
for the count - note the single arrow inside the function call, because it
needs `jsonb`, not text.
