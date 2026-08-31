## Hint 1
Nothing here is about StrictMode being awkward. StrictMode is a test the
component either passes or fails, and it is asking one question: does running
setup, cleanup, setup leave the world in the same state as running setup once?

## Hint 2
The counters in the gate tell you which half is missing. A setup with no
cleanup is not a bug that StrictMode causes - it is a bug StrictMode reveals,
and the same asymmetry is what leaks a connection per mount in production.
