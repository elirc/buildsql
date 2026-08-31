## Hint 1

A plain GROUP BY report (lesson 07) - except the measure lives inside a JSONB document and comes out of the double-arrow as text, which avg() refuses to touch.

## Hint 2

Cast before you aggregate: avg((payload ->> 'value')::int). The inner parentheses matter - the cast applies to the extracted text, not to the payload column.
