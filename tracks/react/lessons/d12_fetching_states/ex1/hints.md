## Hint 1
There are two things on screen here, never at the same time: the sentence you
show while the promise is pending, and the data you show once it settles. One
piece of state can express both if you choose its empty value carefully.

## Hint 2
`null` means "no answer yet". Return early while the state is `null`, with a
live region - `role="status"` - so a screen-reader user is told that something
is happening. The dots the stub renders say nothing to anybody.
