## Hint 1
A controlled input renders state and reports events. The box shows `value`, the
handler decides what the next state is - and deciding includes deciding not to
change it.

## Hint 2
Read the proposed value out of the event, test it against both rules, and
return early when it fails. Because the input is controlled, a keystroke you
did not store is a keystroke React immediately paints back over.
