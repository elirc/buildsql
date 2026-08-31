## Hint 1

The two-state split — what is in the box, what has been asked — is already
right, and the debounce is not a debounce. A `setTimeout` with nothing to
cancel it delays every keystroke by 300ms and sends all of them.

## Hint 2

Return a cleanup that clears the pending timeout. React runs it before the next
run of the effect, so each keystroke cancels the request the previous one was
about to make.

## Hint 3

Then the second effect. Debouncing makes a race rarer and cannot remove it: a
slow answer to an old query still arrives after a fast answer to a new one.
That needs the flag-in-a-cleanup guard, in the effect that does the searching.
