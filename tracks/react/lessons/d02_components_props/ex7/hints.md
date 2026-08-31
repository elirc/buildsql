## Hint 1
A name and a description are two different things in the accessibility tree.
The name is what the control is called; the description is extra detail read
after it. Text placed inside the button becomes part of the name.

## Hint 2
So the description has to live in its own element outside the button, joined to
it by `aria-describedby`, which takes the *id* of that element. `useId` gives
you an id that is unique even when the component is rendered twice on a page.

## Hint 3
When there is no description there must be no attribute either - a
`aria-describedby` pointing at nothing is a silent bug that survives code
review. You already know how React treats an attribute whose value is
`undefined`; decide where that ternary goes.
