## Hint 1
`USING gin` on the bare column - no expression, no key names.

## Hint 2
`CREATE INDEX products_attributes_gin_idx ON products USING gin (attributes);`
