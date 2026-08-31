## Hint 1

Write the layout down as offsets before you write any code:

```
0  magic  4 bytes ascii
4  flags  uint8
5  count  uint32 LE
9  id     uint16 BE
11 name   8 bytes ascii, NUL padded
```

`Buffer` has a named reader for each of those widths and orders, and
`buffer.toString(encoding, start, end)` takes a range.

## Hint 2

Check the length **first**. Every `readUInt32LE` past the end of a buffer throws
`ERR_OUT_OF_RANGE`, which tells whoever is reading the log an offset and nothing
about what went wrong. The magic check comes second, and it is the whole reason
the magic is there: four bytes that say you are looking at the right kind of
file before you believe the numbers behind them.

The padding on a fixed-width text field is not part of the value. Trimming
trailing NULs is one `replace`, and forgetting it produces a name that prints
correctly, compares unequal to everything, and takes an afternoon to spot.
