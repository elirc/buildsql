## Hint 1

Look at how the gate uses this: it never passes a `selected` prop to a tab or a
panel, and it never will — that is the deal a compound component offers. So the
parts have to learn which tab is selected from somewhere other than their props.

## Hint 2

A context created in this file, provided by `Tabs`, read by `Tab` and `Panel`.
Put both the selected id and the way to change it in the value, and keep the
context itself private to the module so callers only ever see the parts.

## Hint 3

The rest is ARIA, and it is not decoration: `role="tablist"` with a name,
`role="tab"` with `aria-selected` on every tab, `role="tabpanel"` on the one
panel that is showing — and only that one should be rendered.
