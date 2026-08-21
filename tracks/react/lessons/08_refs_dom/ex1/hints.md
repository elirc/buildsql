## Hint 1
Focusing is something you do to a *DOM node*, and there is no prop for "be
focused". You need the node itself — which means a ref — and you need to wait
until React has actually put it in the document, which means an effect.

## Hint 2
```tsx
const field = useRef<HTMLInputElement>(null);
…
<input id="auto-focus" ref={field} />
```

`useRef(null)` returns a box with a `.current` property. Passing that box as an
element's `ref` makes React fill `.current` with the DOM node after it commits,
and set it back to `null` when the element goes away.

## Hint 3
The focus call cannot go in the render body — during render the node does not
exist yet and `.current` is still `null`. Put it in a `useEffect`, use `?.` to
be honest about the nullability, and think about what the dependency array
should be for something that must happen once when the component appears.
