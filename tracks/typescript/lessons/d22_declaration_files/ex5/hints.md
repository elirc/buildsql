## Hint 1

Declaring the same interface name twice in one scope is not an error - the
declarations merge, and the resulting type has the members of both.

## Hint 2

Try the same thing with `type RequestContext = ...` twice and read the error.
The difference between the two forms is the whole point of the exercise, and it
is the reason a library that wants to be extended publishes interfaces.

Left to you: whether the two declarations should be adjacent. Here they are, for
readability; in real code they are usually in different files, which is what
makes the mechanism useful and dangerous at the same time.
