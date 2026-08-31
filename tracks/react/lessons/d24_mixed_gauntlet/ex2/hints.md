## Hint 1

Three things are missing. Promoting does not move anybody; the list of leads
grows for ever, so there are soon two; and an empty roster renders an empty
list instead of saying anything.

## Hint 2

Start with the state, and ask how little of it there is. There is one lead at a
time, so it is one value rather than a list — and once it is one value, the
"clear the previous lead" problem does not exist to be forgotten.

## Hint 3

The order on screen follows from the lead, so it does not need storing either:
the lead first, then everybody else in the order the prop gives them. Derived
during render, it also stays right when the roster prop changes underneath you
— which is what the last part of the gate checks.
