## Hint 1

An aggregate that concatenates instead of counting. Like every aggregate it
runs per group, and like no other it cares about the order of its input.

## Hint 2

`string_agg(name, ', ' ORDER BY id)` - the `ORDER BY` goes *inside* the
aggregate call. The query's own `ORDER BY` sorts the six output rows and has
no influence on the order inside each string.
