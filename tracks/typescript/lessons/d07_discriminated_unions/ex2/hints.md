## Hint 1

Pin the three action tags: `"coin"`, `"buy"`, `"refund"`. Then treat this like
any reducer - a `switch` whose every branch returns a brand new state object.

## Hint 2

`{ ...state, credit, message }` is the shape of three of the four returns. The
successful `buy` is the only one that touches `dispensed`, and it has to build a
new array (`[...state.dispensed, action.slot]`) rather than pushing into the old
one - the gate keeps the previous state and checks.

Compute the new credit into a local before you build the message, so the number
in the text and the number in the field cannot disagree.

Left to you: whether the failed `buy` should also clear or keep the credit. The
prompt says keep - be able to say why that is the kinder behaviour.
