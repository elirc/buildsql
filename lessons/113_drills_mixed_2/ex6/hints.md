## Hint 1

"One of the two tags but not both" is a symmetric difference - two set operations (lesson 11) over two containment tests (lesson 19), or one boolean trick.

## Hint 2

(eco EXCEPT sale) UNION (sale EXCEPT eco). Each containment test is attributes -> 'tags' @> '["eco"]' and its sale twin.

## Hint 3

The boolean spelling in the reference - WHERE (has_eco) <> (has_sale) - works because XOR is exactly "the two booleans differ". Both shapes must return identical rows; if yours differs, check whether you excluded the eco-AND-sale products or only one direction of them.
