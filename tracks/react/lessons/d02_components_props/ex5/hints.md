## Hint 1
Four known statuses, one unknown case, two possible roles. A lookup object
keyed by status keeps the wording in one place and makes "is this a status I
know about" a single question.

## Hint 2
A component may return `null`, and that renders nothing at all - no wrapper, no
empty span. That is the honest answer for a status this component was never
told about.
