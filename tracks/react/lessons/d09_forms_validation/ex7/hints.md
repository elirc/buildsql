## Hint 1
Three states, not two. The handle has not been checked, is being checked, or has
been judged - and Save is only possible in one of them. Write down what each
state looks like on screen before you write any code.

## Hint 2
The check belongs on blur, not on change: one request per finished handle rather
than one per keystroke. `checkAvailable` returns a promise, so the handler that
awaits it has to be `async`.

## Hint 3
Every keystroke invalidates the last verdict, so the change handler has to clear
the status, the error and the permission to save. That leaves one decision worth
thinking about: what should happen if the user edits the box while a check is
still in flight, and whether the answer that arrives afterwards is still about
anything.
