## Hint 1
Count the independent things this component keeps in step with the chart. Then
count the effects. The mismatch is the exercise.

## Hint 2
A dependency array is a claim about one piece of synchronisation: "re-run me
when these change, because then my work would come out different". Two pieces of
work with different triggers cannot share one honest claim.

## Hint 3
Splitting is mechanical: one effect whose array names the data it pushes,
another whose array names the size. Neither of them mentions the theme, because
neither of them reads it - and the theme is still rendered as ordinary markup.
