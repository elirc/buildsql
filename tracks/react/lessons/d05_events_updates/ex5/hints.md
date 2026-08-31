## Hint 1
A keydown event carries more than the key. Which key it was, and which
modifiers were held, are separate pieces of information on the same object, and
this box has to look at both before it decides anything.

## Hint 2
`event.key` is `"Enter"` or `"Escape"`; `event.shiftKey` is a boolean. Enter
with no shift sends and clears; Escape only clears; anything else, including
Shift and Enter, is left alone so the textarea can insert its newline.

## Hint 3
When you do submit, cancel the default: without `preventDefault` the newline
goes into the box as well, and you have just sent a message and started a
second line of the one you sent. Decide whether Escape needs the same treatment.
