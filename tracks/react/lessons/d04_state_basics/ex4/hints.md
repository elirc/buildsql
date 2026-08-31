## Hint 1
The stub calls `push` and `shift`. Both of those edit the array that is already
sitting in state, and neither of them tells React anything - the screen is
still showing the render that was made before the edit.

## Hint 2
State is replaced, never edited. `[...current, item]` and `current.slice(1)`
both hand back a brand new array; `push`, `shift`, `splice` and `sort` all
change the one you were given. Learn which is which by what they return.

## Hint 3
Which name is added is a question about the queue, not about the props: the
next name is `names[queue.length]`. Reading that inside the updater callback
means you are reading the length React is about to apply the change to, rather
than the length from the render you clicked in.
