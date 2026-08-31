## Hint 1

An anti-join whose inner side is a JSONB slice of the event stream: views with a payload value of 999 or more, matched to the product by its page path.

## Hint 2

Either correlate (NOT EXISTS with payload ->> 'path' = '/p/' || p.id) or reduce first: a CTE of DISTINCT hot-viewed product ids parsed from the path, then products LEFT JOIN it and keep the NULLs.

## Hint 3

The reduce-first shape scans three million events once instead of once per product - with 69 candidate products either survives, but the habit of shrinking the big side before an anti-join is what keeps this pattern alive on real data. Both value tests need the ::int cast; text comparison would let '99' beat '999'.
