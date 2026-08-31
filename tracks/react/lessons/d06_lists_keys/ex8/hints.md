## Hint 1
Nothing about the filtering is wrong. Ask instead where a ticked checkbox
keeps the fact that it is ticked, and what happens to that fact when React
decides two rows from two different renders are the same row.

## Hint 2
Filtering does not just shorten the list - it changes which item sits at which
position. Any key derived from the position therefore says that Sourdough and
Milk are the same row, and React reuses the DOM node accordingly.

## Hint 3
Give each row a key that belongs to the item and the DOM node follows the item
in and out of the filter. Worth thinking about afterwards: if the ticks had
been React state instead of DOM state, would this bug have shown up at all -
and where would you have had to put that state?
