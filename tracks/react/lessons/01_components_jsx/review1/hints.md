## Hint 1
Three sibling elements, no wrapper asked for: a label, a control, and the hint
text. Two invisible wires connect them, and both are made of `id` strings —
one from the label to the input, one from the input to the hint.

## Hint 2
`htmlFor` is JSX's spelling of the HTML `for` attribute (`for` is a reserved
word in JavaScript), and it must equal the input's `id` exactly.
`aria-describedby` goes the other way: it lives on the *input* and holds the
`id` of the element containing the description.

## Hint 3
The hint element needs an id of its own, and the component is only given one
id. Derive a second one from it above the `return` — a template literal is the
usual way — then use it in exactly two places.
