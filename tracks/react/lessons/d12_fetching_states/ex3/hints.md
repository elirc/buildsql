## Hint 1
The stub cannot tell the two empty screens apart because it starts the results
off as `[]` - which is also what a successful search for nothing looks like.
Pick a starting value that no successful answer could ever be.

## Hint 2
Three branches in order: no answer yet, an answer with nothing in it, and an
answer with something in it. Note that the empty message names the query, so
it has to be built from the prop rather than hard-coded.
