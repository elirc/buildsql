## Hint 1
The stub gets the order right and still fails. Read the log the gate builds and
ask which event never happens - then ask which moment the stub has no code for
at all.

## Hint 2
Hand-rolling the teardown in a ref means you are re-implementing something
React already does, and you will always forget one of the two moments it fires:
between runs, and on unmount. Return the disconnect function instead and delete
the ref.
