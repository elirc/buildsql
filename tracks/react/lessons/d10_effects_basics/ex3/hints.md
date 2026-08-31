## Hint 1
Ask the question that decides every effect: is this synchronising with
something outside React, or is it just arithmetic? Nothing outside this
component wants to know the total.

## Hint 2
Anything you can work out from props during render should be worked out during
render, in a plain `const`. The gate counts renders through `onRender` because
the effect version costs a second one - and shows the stale number in between.
