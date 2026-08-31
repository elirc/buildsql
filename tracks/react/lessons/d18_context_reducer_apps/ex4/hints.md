## Hint 1

Select one row of three and look at the All box: it says "no rows are
selected", which is a lie. A checkbox has three states, and the third one has
no JSX attribute — which is the whole difficulty.

## Hint 2

`indeterminate` is a property you set on the DOM node itself. Get a ref onto
the input and write to it from an effect, keyed on whether the selection is
currently partial.

## Hint 3

Work out `all` and `some` from the ids the provider knows about and the ids
that are selected — neither belongs in state. And decide what clicking a
partial box should do: finishing the selection is kinder than clearing it.
