## Hint 1

`canNext` currently means "there is a step after this one". It also has to mean
"this step is finished" — and what finished means depends on which step you are
on. Step one is finished when the email is not empty.

## Hint 2

Write that as one small function of the state and call it from the provider, so
the derived flag reaches `FlowNav` through the context. The email field and the
button never have to know about each other.

## Hint 3

Put the same check inside the reducer's `next` case as well. A disabled button
is a courtesy to the user; the reducer is the thing that actually guarantees
nobody reaches step two without an email.
