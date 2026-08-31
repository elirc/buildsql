## Hint 1
Same idea as ex1, on a bigger table and with the key in the middle of the
list.

## Hint 2
Do not add `DISTINCT`. Every customer has a unique `id`, so it would
change nothing except the plan - a sort over the whole customer table for no
benefit.
