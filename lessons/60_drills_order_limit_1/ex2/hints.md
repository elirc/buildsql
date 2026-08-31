## Hint 1
Alphabetical means ascending on the text column. The key list is the same
shape as ex1.

## Hint 2
Look hard at the ten names you get back. Every product name ends in its
own id, and text sorts character by character - so `Aero Blanket 1372` lands
before `Aero Blanket 141`. That is correct, and it is the reason numbers
stored as text are a recurring production bug.
