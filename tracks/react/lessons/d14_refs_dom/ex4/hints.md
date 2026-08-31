## Hint 1

Run the stub's loop in your head with all three fields empty. It visits every
one of them, and each visit overwrites the message and moves the cursor — so
the user is told about the last problem and dropped at the bottom of the form.

## Hint 2

You want the first empty field, not all of them. `Array.prototype.find` stops
at the first match; once you have it, set the message, focus its node and
return. Keeping the fields in one array of `{ label, node }` makes the order
you check them in the order they appear on screen.
