## Hint 1
The trap in reverse: `manager_id <> 1` is *unknown* for the CEO's NULL, so
she vanishes. You want NULL to count as "different from 1" — the concept
section names the operator that does exactly that.

## Hint 2
`WHERE manager_id IS DISTINCT FROM 1` — two columns, table `staff`, done.
