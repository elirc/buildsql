## Hint 1

Work through the gate's sequence on paper, writing the id beside each toast.
Three toasts get 0, 1 and 2. Dismiss the middle one and add a fourth — what id
does it get, and who already has it?

## Hint 2

`toasts.length` describes how many toasts are on screen, which stops being the
same thing as "how many have ever existed" the first time one is dismissed. An
id has to be unique for the life of the list, so the number that produces it
has to only ever go up.

## Hint 3

That counter is part of the state: it is a fact about the list that no other
field records, and the reducer is the only thing allowed to advance it.
