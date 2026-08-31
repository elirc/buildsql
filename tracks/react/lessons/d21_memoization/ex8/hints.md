## Hint 1

Two things must survive a theme change: the series, which is expensive to
build, and the legend, which is already memoized and still redraws. Both have
the same cause — a line in the panel's body that runs again on every render.

## Hint 2

`buildSeries(points)` runs on every render and returns a new array each time,
which is both the wasted work *and* the changed prop. One `useMemo` fixes
both, if its dependency array names what the series is really made of.

## Hint 3

The other prop the legend takes is a function written inline. Note what happens
after you fix the first two: picking a label changes `picked`, the panel
re-renders — and the legend still must not, because nothing it is given
changed. That is the check that proves all three tools are pulling together.
