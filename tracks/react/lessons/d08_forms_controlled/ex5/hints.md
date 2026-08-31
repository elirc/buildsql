## Hint 1
The state is the text in the box, not the quantity. A number cannot represent
"the user has deleted everything and is about to type something else", and that
is a state the box has to be able to be in.

## Hint 2
Three moments, three jobs. On change: reject anything that is not digits, then
store the text and report `null` for empty or `Number(text)` otherwise. On
blur: clamp. The clamp only belongs on blur, because clamping mid-typing turns
`10` into `1` before the user has finished.
