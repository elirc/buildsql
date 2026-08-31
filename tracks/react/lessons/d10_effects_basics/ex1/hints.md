## Hint 1
The stub has no dependency array at all, which is the strongest possible claim:
run again after every render, forever. Ask what this effect actually reads, and
say only that.

## Hint 2
The array is a list of the values the effect uses - here that is the room it
joins and the function it joins with. Everything else the component renders is
none of the effect-s business, and leaving it out is the point.
