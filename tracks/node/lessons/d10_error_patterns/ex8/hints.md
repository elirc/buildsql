## Hint 1

Four steps in `handle`, and each of the last three has a failure mode of its
own:

1. normalise whatever arrived into an `Error` (ex1 again);
2. classify it — inside a `try`, because the classifier is code too;
3. route it;
4. deal with a routing handler that fails.

Write the happy path first, then add one guard at a time and check it against
the gate's four scenarios.

## Hint 2

Two of the three guards are asymmetric on purpose, and being able to say why is
the exercise.

A `classify` that throws means you do not know what you are looking at, and the
safe assumption is the worse one — but the error you report is the **original**,
not the classifier's complaint, because the original is what somebody has to
fix.

An `onOperational` that throws is a failure of your error handling, which is
itself a fatal problem: send *that* error to `onFatal`.

## Hint 3

`onFatal` is deliberately **not** wrapped. When the last handler in the chain
fails there is nowhere left to send anything, and catching it would lose both
errors silently. Letting it escape is what makes a process-level handler behave
the way an operator expects — loudly.

The remaining decision is whether `onFatal` receiving a handler failure should
also get the original error attached, say as `cause`. The gate does not require
it; an on-call engineer would thank you for it.
