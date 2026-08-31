## Hint 1

Two separate bugs, one on each side of the store. The read happens as an
ordinary expression in the provider's body, which means every render. The write
happens in an effect with no guard, which means the very first render too — so
opening the app immediately saves the draft it has just loaded.

## Hint 2

`useReducer` takes a third argument for the first problem: the value to start
from, and a function to turn it into state. React calls that once.

## Hint 3

For the second, the effect needs to know whether this is the first time it has
run. A ref is memory that survives a render without causing one, and consuming
it inside the effect keeps the dependency array honest.
