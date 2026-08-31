## Hint 1
`useState(initialTitle)` reads its argument on the first render of this
component and never looks at it again. Everything the gate asks for follows
from that one sentence: the draft survives re-renders, and nothing about a new
prop reaches it.

## Hint 2
The component has to notice the change itself, which means remembering which
note it is currently showing. Compare the id you were given with the id you
remember, during render, before you return anything.

## Hint 3
Setting state during render is legal when you are adjusting this component to a
prop that changed: React throws the in-progress output away and renders again
immediately, with no flash and no effect. Guard it with the comparison so it
cannot loop, and decide whether the same job could be done by the parent with a
`key` instead - be ready to say which you would ship.
