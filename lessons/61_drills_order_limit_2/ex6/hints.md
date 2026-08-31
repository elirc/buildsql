## Hint 1
`ORDER BY` names columns of the *table*, not of the output. It is not
restricted to what you selected.

## Hint 2
Two columns out, two sort keys, neither of which is `name`. If you are
tempted to select `price` and then drop it, you do not need to - just sort
by it.
