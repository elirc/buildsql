## Hint 1
Lesson 40's expression-index move but with `USING gin` and the bare
column - no expression needed, JSONB is GIN's native food.

## Hint 2
`CREATE INDEX products_attributes_idx ON products USING gin (attributes);`
