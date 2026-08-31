## Hint 1
`subscribe` already hands you everything you need - look at what it returns and
ask who is supposed to call it.

## Hint 2
Whatever an effect returns, React treats as its cleanup and runs before the
next run of that effect and once more on unmount. Note that
`useEffect(() => subscribe(setNames), deps)` returns it by accident, which is
either elegant or too clever depending on who reviews your code.
