## Hint 1
Three independent fields, each built with functions you have already
used in this set, plus one new one for the zero padding.

## Hint 2
`lpad(string, length, fill)` pads on the left to the given total length.
It needs text, and `id` is an integer - so cast it before padding, not
after.

## Hint 3
Build and check each field on its own before joining them. The most
common failure is a field that is right but a separator that is missing,
and a six-character pad is easy to write as five. Compare your output for
product 7 against the example in the prompt, character by character.
