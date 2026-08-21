## Hint 1
Right now the browser owns what is in the box and React has no idea what it
says — which is why the counter cannot move. Make React the owner: hold the
text in state, render that state as the input's `value`, and update the state
when the input reports a change.

## Hint 2
```tsx
const [name, setName] = useState("");
…
<input id="full-name" value={name} onChange={(event) => setName(/* … */)} />
```

Those two attributes always travel together. `value` without `onChange` gives
you a box that cannot be typed into and a React warning; `onChange` without
`value` leaves the browser in charge.

## Hint 3
Because the box renders `name`, whatever you put in state is what the user
sees — so transforming the value on its way in is all it takes to force
uppercase. `event.target.value` is the text the browser now has;
`String.prototype.toUpperCase()` does the rest. The counter then reads a length
you already have, and deciding whether to count before or after the transform
is a question worth two seconds of thought.
