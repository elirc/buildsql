## Hint 1
Two independent conditions joined by `AND`: one membership test, one
range test.

## Hint 2
If you expand the `IN` into an `OR`, you must bracket it. `dept = 'a' OR
dept = 'b' AND salary BETWEEN ...` parses as `dept = 'a' OR (dept = 'b' AND
...)`, which is a different question. `IN` avoids the problem by having no
precedence to get wrong.
