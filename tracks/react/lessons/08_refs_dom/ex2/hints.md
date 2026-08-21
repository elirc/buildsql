## Hint 1
Two different kinds of memory are needed here. The tap count has to survive
between renders but nothing on screen depends on it, so changing it should not
render anything. The revealed total *is* on screen, so changing it must.

## Hint 2
`useState` is for the second kind. `useRef` is for the first: it holds a value
across renders in `.current`, and writing to it does **not** schedule a render.

```tsx
const taps = useRef(0);
…
onClick={() => { taps.current += 1; }}
```

A plain `let` outside the component would be shared by every instance; a plain
`let` inside would reset on every render. A ref is per-instance and persistent.

## Hint 3
Reading `taps.current` while rendering is a bad habit — React makes no promise
about when a ref is up to date relative to a render — but reading it inside an
event handler is exactly what refs are for. That is where "Show total" should
get its number from. The last decision is what the display should do if the
user taps again after revealing the total.
