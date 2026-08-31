## Hint 1
`children` here is not markup - it is a function waiting to be called with the
state this component owns. The component holds the behaviour; the caller
decides what it looks like.

## Hint 2
So the component needs real state and a real updater, and it renders the result
of calling `children(...)`. The updater form of `setState` is what keeps
`toggle` correct no matter how stale the closure around it gets.

## Hint 3
Watch what surrounds the returned markup. A render-prop component that wraps
the result in a `<div>` has quietly made a layout decision that belongs to the
caller - there is a way to return the children with nothing around them.
