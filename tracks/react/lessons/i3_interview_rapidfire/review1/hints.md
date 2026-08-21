## Hint 1
Two independent problems. One is that an empty inbox renders an empty list
instead of saying anything. The other is a single character on the page that
should not be there — run the gate and read which.

## Hint 2
`&&` returns its **left operand** when that operand is falsy, so
`{unread && <span/>}` evaluates to the number `0`, and React renders `0`. It
skips `false`, `null` and `undefined` only; `0`, `""` and `NaN` are falsy in
JavaScript and perfectly renderable. Make the left side a real boolean.

## Hint 3
For the empty state, an early return keeps the main path un-nested. Note that
`items.length && <List/>` is the same bug wearing different clothes, and is even
more common — being able to name both on sight is what this round is for.
