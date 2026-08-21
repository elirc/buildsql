## Hint 1
Lesson 04 showed this with an uncontrolled input, where the browser owned the
value. Here the thing that goes to the wrong row is a `useState` inside the row
component — which tells you the rule is not about the DOM at all. Keys decide
which **component instances** survive.

## Hint 2
Prepending gives every row a new index, so with `key={index}` React matches
row 0 to row 0 and concludes the first row simply changed its `player` prop. It
keeps that component instance — and its hook state — and re-renders it with
somebody else's name.

## Hint 3
Key by the field that belongs to the player and does not move when the list
does. Then be ready for the follow-up: how would you *deliberately* reset a
row's state when a prop changes — and why is changing the key the cleanest
answer to that too?
