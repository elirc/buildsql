## Hint 1
Two separate bugs live in the stub. It resets when the product object is
rebuilt but not really changed, and it resets one render too late - after a
commit in which the user could see a mug offered in a bean size.

## Hint 2
The selected size is only meaningful together with the product it was chosen
for. Store both together, and the question "does this choice still apply?"
becomes a comparison you can make during render.

## Hint 3
With the pair in state, the size you display is derived: use the stored size
when the stored id matches the current product, otherwise fall back to the
current product-s first size. No effect, no second render, and nothing to keep
in step. What you store on a click is your decision.
