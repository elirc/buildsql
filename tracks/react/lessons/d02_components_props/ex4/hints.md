## Hint 1
Ask who owns this number. The parent passes it in and the parent is told when
it should change - so there is nothing left for the component to remember
between renders.

## Hint 2
Delete the `useState`. The displayed number is the `value` prop; the buttons
call `onChange` with the number the parent should adopt next, and the component
renders whatever comes back as a new prop.

## Hint 3
Both ends need guarding, and the guard is a comparison against the props you
were given, evaluated during render. Decide whether an exactly-at-the-limit
value counts as disabled - the gate has an opinion, and so should you.
