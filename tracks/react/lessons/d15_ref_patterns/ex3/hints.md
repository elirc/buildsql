## Hint 1

The shape is already there — `useImperativeHandle` is called, the three methods
exist, and the parent's ref really does point at that object. The bodies are
empty, and what they have to do is change this component's own state.

## Hint 2

This is why a DOM node would not do: `play()` has to flip a piece of React
state, which no `<p>` element can. Note that the state setters are stable, so
an empty dependency array on the handle is honest here — the object never needs
rebuilding.
