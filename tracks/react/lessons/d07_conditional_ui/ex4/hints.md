## Hint 1
Four states that share nothing but a place on the page. When the branches
differ in structure rather than in a word or two, nested ternaries stop paying
their way - a `switch` with a `return` in each arm reads like the spec does.

## Hint 2
The union is discriminated by `status`, so once you have switched on it
TypeScript knows `trackingUrl` exists in the shipped arm and `reason` in the
cancelled one. Two of the four arms need a specific element rather than a
paragraph: a real link, and a `<time>` carrying the ISO date.
