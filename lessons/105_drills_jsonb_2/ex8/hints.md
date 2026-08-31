## Hint 1

A pair is two elements of the same array, so the array has to be expanded twice - two set-returning calls over the same tags array, side by side in the FROM clause.

## Hint 2

Two expansions give you every ordered combination, including (x, x) and both (x, y) and (y, x). One comparison in the WHERE clause collapses all of that to each unordered pair exactly once.

## Hint 3

WHERE a.tag < b.tag is that comparison. Then group by the two tags and count. (Every product here carries exactly two distinct tags, which a different solution can exploit: least() and greatest() of elements 0 and 1 name the pair without expanding anything.)
