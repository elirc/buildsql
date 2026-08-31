## Hint 1

The toolbar takes a `disabled` prop and does nothing with it. Passing it to
each button by hand would work here and would mean every future button — and
every button nested a level deeper — has to remember to accept and forward it.

## Hint 2

A context published by the toolbar and read by the button reaches any depth
without anybody passing anything. Give it a default of `false`, so a button
used outside a toolbar still works.

## Hint 3

A button can also be disabled on its own account. Both reasons count, and
neither should be able to turn the other off — which is one boolean expression
in the `disabled` attribute.
