## Hint 1
Two defects, and they compound. Count how many listeners are attached after
three renders, and count how many are attached after the component is removed
from the page.

## Hint 2
An effect with no second argument runs after **every** render, so each render
adds another listener. And an effect that returns nothing never takes anything
back, so none of them are ever removed — not on re-render, not on unmount.

## Hint 3
Return a cleanup that removes the listener, and give the effect a dependency
array listing what it reads. Note that the handler must be declared inside the
effect for `removeEventListener` to be handed the same function object it was
given. The judgement call left to you is what belongs in the array, and what
that means for how often the subscription is torn down and rebuilt.
