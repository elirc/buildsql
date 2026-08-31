## Hint 1
The stub already notices the failure - it just throws away everything the
failure said and announces nothing. Two questions: where does the message come
from, and which role makes a screen reader interrupt to read it?

## Hint 2
`promise.then(onFulfilled, onRejected)` (or a `.catch`) hands you the rejection
reason. Keep the message in state rather than a boolean, and render it inside
`role="alert"`. Remember that a rejected request is no longer loading: the
error branch has to come before the loading branch, or the spinner wins.
