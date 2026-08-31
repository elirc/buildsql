## Hint 1

`enum Lane { Left = "left", Center = "center", Right = "right" }` declares a type
*and* a value under one name. The members are their strings at runtime, which is
why the gate can compare `Lane.Center` with `"center"` - and the type is still
nominal, which is why `laneOffset("left")` must not compile.

## Hint 2

Keep one ordered array of the three members. The offset is `indexOf(lane) - 1`,
because the centre lane sits at index 1.

For `shift`, lanes do **not** wrap: clamp the target index into range with
`Math.min` and `Math.max` rather than taking a remainder.

Left to you: an array of members, or a `Record<Lane, number>` of offsets. The
second reads better for `laneOffset` and gives you nothing for `shift`.
