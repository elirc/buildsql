## Hint 1

`defaultValue` is a starting value, not a binding — React hands it to the DOM
once and then stops caring. So the `code` state in the stub and the text on
screen are two unrelated things, and `Apply` is reading the one nobody typed
into.

## Hint 2

Delete the state. The node itself is the source of truth for an uncontrolled
field: get a ref onto the `<input>`, read `.value` when Apply is pressed, and
write `.value` (plus `.focus()`) when Clear is pressed.
