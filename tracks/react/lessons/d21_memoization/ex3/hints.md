## Hint 1

This is the failure mode worth remembering above all the others: a wrong
dependency array does not make a component slow, it makes it **wrong**. The
slug is computed once and then shown for ever, whatever the title does
afterwards.

## Hint 2

A dependency array is a claim: "this value is made out of exactly these
things". List everything the factory reads — the title, and the callback it
calls — and the memo becomes an optimisation instead of a bug.
