## Hint 1

Store the write time next to the value. A `Map<string, { value: T; writtenAt:
number }>` is the whole data structure, and `now()` is called once per operation.

## Hint 2

Expiring on read - delete the entry, then return `undefined` - is what makes
`size()` fall without a background timer. A cache that only checks on read is
called lazy expiry, and it is what almost every in-process cache does.

Left to you: whether `get` should also expire *other* keys while it is there.
Doing so bounds the memory; doing it on every read costs a scan. Neither is
wrong, and the gate does not care.
