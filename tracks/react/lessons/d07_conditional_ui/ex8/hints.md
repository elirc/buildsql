## Hint 1
Ask where the typed text is being kept. In the stub it is kept by the DOM node
of an uncontrolled textarea - and that node only exists while the Write branch
is on screen.

## Hint 2
Anything that has to outlive a branch has to be stored outside it. The draft
belongs in state next to the tab, and the textarea becomes controlled: value
from state, state from `onChange`.

## Hint 3
The preview then has something to show, which is the other half of the point -
one piece of state feeding two different renderings of it. Worth thinking
about: if the requirement had been to keep the scroll position of the textarea
too, would lifting state have been enough?
