## Hint 1
Each button already knows which chip it belongs to — it was created inside the
map, so the chip is in scope. The only missing pieces are a handler that takes
that chip's identity and a state update that produces a list without it.

## Hint 2
`onClick` wants a function taking no arguments, so wrap the call:

```tsx
onClick={() => remove(chip.id)}
```

and remove by producing a new array:

```tsx
setChips((previous) => previous.filter((chip) => /* … */));
```

`filter` returns a copy; `splice` edits the array you are holding, which leaves
the state reference unchanged and renders nothing.

## Hint 3
Remove by **id**, not by index. Removing by index works right up until the list
is sorted, filtered or re-fetched between the render and the click — the same
identity-versus-position mistake as ex2, wearing different clothes. The last
decision is what the list should look like once it is empty.
