## Hint 1
Everything about which row is open lives in one piece of state, and it is not
a boolean. Ask what value answers the question "is this row the one being
edited" for every row at once.

## Hint 2
The draft text is separate state from the list, which is what makes Cancel a
one-liner: throw the draft away and close the editor without touching the
list.

## Hint 3
The stub finds the item and assigns to `item.text`. That object is the one the
caller handed you, so you just edited data you do not own, and React has no
way to tell what changed. Build a new array with `map`, returning a new object
for the row that changed and the original object for every other row.
