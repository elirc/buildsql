## Hint 1
Whether the value is valid and whether the user should be told about it are two
different questions. The stub only asks the first one, which is why it shouts
at somebody who has typed one letter.

## Hint 2
Keep the rule derived during render, and add one more piece of state for the
second question - the usual name for it is `touched`, and the moment it becomes
true is `onBlur`. Show the message only when both are true, and notice that
this gives you the forgiving half for free.
