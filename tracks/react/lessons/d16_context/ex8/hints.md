## Hint 1

Follow one setting down the gate's tree. The outer provider says `locale: fr`;
the middle one says nothing about the locale at all, and yet the readout inside
it goes back to English. Ask what the middle provider is merging *onto*.

## Hint 2

`DEFAULTS` is only the right base at the very top. Everywhere else the base is
whatever the nearest provider above published — which a provider can read with
`useContext` before it replaces it, exactly as exercise 6 did with a number.

## Hint 3

Keep the `useMemo`, and get its dependency list right: the merged value depends
on what was inherited as well as on what was passed in, so both belong in the
array.
