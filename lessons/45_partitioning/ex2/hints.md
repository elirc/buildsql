## Hint 1
Copy the query in. If the gate reports events_p_oct in the plan, your
partition bounds probably don't split at November 1 - reread ex1's
FROM/TO values.

## Hint 2
This one is diagnostic, not creative: the query is given, pruning
either happens or it doesn't. `dojo plan 45_partitioning ex2` shows
which partitions survive.
