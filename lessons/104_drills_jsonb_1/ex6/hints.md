## Hint 1

This one builds a document rather than reading one. The function takes the
keys and values as alternating arguments.

## Hint 2

`jsonb_build_object('name', name, 'price', price, 'color',
attributes->>'color')`. Pass `price` as the numeric column, not as text, so
it lands in the document as a JSON number.
