## Hint 1
The parent creates the ref and expects it to end up pointing at the real
`<input>`. Your component sits in between, receives it, and currently drops it
on the floor — so `field.current` is still `null` when the button is clicked.

## Hint 2
In React 19 a `ref` handed to a function component arrives as an ordinary prop,
already destructured for you in the signature. Forwarding it is one attribute:

```tsx
<input id="fancy" className="fancy" ref={/* … */} />
```

## Hint 3
Note what you did *not* have to do: unwrap it, check whether it is an object or
a function, or call it. A ref prop can be either shape and React handles both
when you hand it to a DOM element. If you have seen `forwardRef` in older code,
that is the pre-19 way of doing exactly this line — it still works, and the
version you have written is what replaces it.
