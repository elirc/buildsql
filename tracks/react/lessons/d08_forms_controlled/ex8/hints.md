## Hint 1
There are two representations of one amount: the digits the component keeps,
and the grouped string the box shows. Decide which one is the state - the other
is derived from it on every render.

## Hint 2
Strip first, then format. `value.replace(/\D/g, "")` throws away everything the
user should not have been able to type, including the commas your own last
render put there.

## Hint 3
Grouping is `digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",")` if you want it in one
line, or a loop if you would rather read it later. The remaining decision is
what to report when the box is empty: `Number("")` is `0`, and `0` is a real
amount somebody might have typed.
