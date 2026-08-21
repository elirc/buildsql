## Hint 1
`ALTER TABLE hot_orders ALTER COLUMN status SET STATISTICS 1000;` then
`ANALYZE hot_orders;` - the ALTER alone changes nothing until you resample.

## Hint 2
Both statements, in that order, in one file.
