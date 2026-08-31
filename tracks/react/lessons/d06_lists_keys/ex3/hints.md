## Hint 1
Two steps that must happen in this order: narrow the array down to the
messages that mention you, and only then ask whether there is anything left to
render.

## Hint 2
An empty result is its own branch, not a list with nothing in it - return the
sentence early and the `map` never runs. The mention test is a plain substring
check for the at-sign followed by the name.
