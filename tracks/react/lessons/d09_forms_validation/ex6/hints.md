## Hint 1
Two separate decisions. Whether the button can be pressed at all is about
whether both boxes have been filled in. Whether the range makes sense is a rule
that only runs once it is pressed, and it belongs to one of the two fields.

## Hint 2
A date input gives you an ISO string, `2024-05-10`, and ISO strings compare
correctly with `<` - no Date objects needed, and no timezone to get wrong. The
rule is strictly before, because a booking that starts and ends on the same day
is a real booking.
