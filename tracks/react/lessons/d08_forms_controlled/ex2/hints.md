## Hint 1
One question, three answers, one piece of state holding the chosen value. Every
radio compares itself to that state to decide whether it is checked - none of
them owns anything.

## Hint 2
Two attributes do the grouping work. `name` is what makes the browser treat the
radios as mutually exclusive, and `role="radiogroup"` with a name is what tells
a screen reader the same thing. A state of `""` is how you say nothing is
chosen yet.
