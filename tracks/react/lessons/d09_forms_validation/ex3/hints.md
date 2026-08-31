## Hint 1
A rule that reads two fields still has to choose one field to attach itself to.
Ask which box the user has to retype to make the problem go away - that is the
one that owns the message.

## Hint 2
Derive both messages during render from the two values, then decide separately
whether to show them. The order matters: an empty password is a
required-field problem, and complaining that nothing matches nothing on top of
it is noise.
