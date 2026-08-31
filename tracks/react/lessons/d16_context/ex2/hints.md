## Hint 1

`Untitled` is a plausible-looking default, and that is the whole problem: a
component rendered outside its provider shows something believable instead of
telling anybody it is not wired up. What default value could never be mistaken
for real data?

## Hint 2

Make the context's default `null`, then let `useWorkspace` be the one place
that knows what a missing provider means. The message has to contain the
provider's name, because that is the sentence that turns a mystery into a
one-line fix.
