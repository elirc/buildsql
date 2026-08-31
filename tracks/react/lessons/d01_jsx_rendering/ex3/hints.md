## Hint 1
A component returns exactly one value, but this one owes its parent two
elements side by side and no box around them. React has a thing that is a
single value and renders nothing of its own.

## Hint 2
The date has two audiences. The reader gets `human`; a machine gets `isoDate`,
and the element that carries both is `<time>`. In JSX the attribute is spelled
`dateTime` and React writes it to the DOM as `datetime`.
