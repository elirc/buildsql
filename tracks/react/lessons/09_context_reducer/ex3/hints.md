## Hint 1
No React here at all: `cartReducer(state, action)` takes the current cart and a
description of something that happened, and returns the cart afterwards. Same
inputs, same output, no side effects — which is why you can test it by calling
it, and why React can call it twice without consequence.

## Hint 2
Every branch has to build a **new array**. The three tools:

- `state.filter(…)` — removal;
- `state.map((item) => condition ? { ...item, changed } : item)` — edit one line
  and keep the others;
- `[...state, newItem]` — append.

`push`, `splice` and assigning to `item.quantity` all mutate, and the gate
checks the state it handed you afterwards.

## Hint 3
Two branches need thought. `added` has to notice whether the item is already
there — one line's quantity goes up, or a new line appears with quantity 1.
And `quantitySet` has a rule hiding in the gate: setting a quantity to zero or
below is not a line showing 0, it is a line that is gone. Whether you express
that by reusing the removal logic or by repeating the filter is your call.
