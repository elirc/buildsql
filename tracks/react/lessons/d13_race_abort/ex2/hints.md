## Hint 1

Read the stub's two callbacks side by side. One of them asks whether it is
still wanted. The other does not, and a rejection is just as much an answer as
a value.

## Hint 2

Every place that touches state after an `await` needs the same question asked
first. Note that the last render's error also has to be cleared when the id
changes, or the alert from the parcel you left is still on screen when the next
one starts checking.
