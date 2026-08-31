## Hint 1
Two of the three lines in this handler are wrong in the same way, and the third
is right for the same reason. Work out what the number `count` is worth inside
the handler, and remember that it cannot change while the handler runs.

## Hint 2
`count` is a constant belonging to the render the click came from. Passing a
function to the setter asks React for the value it will be holding when the
update is applied instead - which is how two updates in one handler add two
rather than one. `onLog` genuinely wants the old value, so it stays as it is.
