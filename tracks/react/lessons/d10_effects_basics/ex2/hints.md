## Hint 1
The dependency array already stops the effect re-running for an unchanged
value. What it cannot express is that the very first run is not a change - the
value did not become `draft one`, it arrived as `draft one`.

## Hint 2
You need one bit of memory that survives a render without causing one. `useRef`
holds a mutable box whose `.current` you can read and write inside the effect;
setting it never schedules a render, which is exactly why state would be the
wrong tool here.
