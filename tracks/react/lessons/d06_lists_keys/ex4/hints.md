## Hint 1
The sorting works. What breaks is where the typed note ends up, and the only
line that decides that is the one that tells React which row in this render is
the same row as in the last one.

## Hint 2
The note box is uncontrolled: its value lives in the DOM node, not in React
state. So when React decides to reuse a DOM node for a different person, the
old text comes along for the ride. `key` is what makes that decision.

## Hint 3
An index is a description of a position, and after a sort every position holds
somebody new. Key by something that travels with the person. While you are
there, look at the copy in front of `sort` - and decide whether the unsorted
branch needs one too.
