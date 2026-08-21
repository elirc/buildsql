## Hint 1

Three stages, and you have written two of them already in this lesson:

1. bytes -> lines (ex3's splitter - copy it into this file, the exercises are
   deliberately isolated),
2. lines -> JSON text, dropping the header and the rows below the threshold,
3. the sink you were handed.

Wire them with `pipeline` and return the counters afterwards. Nothing here
holds the whole input in memory, which is the point: this same function works
on a four-gigabyte export.

## Hint 2

The middle transform has `writableObjectMode: true` (strings come in from the
splitter) and a plain byte-mode readable side (text goes out to the sink).

Three rules for it:

- skip blank lines entirely - the last line of a file that ends with a newline
  is one of these;
- the first non-blank line is the header, so consume it and count nothing;
- for a data row: `split(",")`, convert the amount with `Number`, compare, and
  emit `JSON.stringify({ id, amount }) + "\n"` only when it passes.

`read` counts every data row you looked at; `written` counts the ones you
emitted.

## Hint 3

The middle stage, in outline:

```ts
transform(line: string, _encoding, callback) {
  const text = line.trim();
  if (text === "") { callback(); return; }
  if (!headerSeen) { headerSeen = true; callback(); return; }

  stats.read += 1;
  const [id, rawAmount] = text.split(",");
  const amount = Number(rawAmount);
  if (/* does it pass? */) {
    stats.written += 1;
    callback(null, /* the JSON line */);
    return;
  }
  callback();
}
```

Two decisions left: the comparison (the gate uses `minAmount: 100` and expects
the row with exactly 250 and the one with 900 - think about whether the
boundary is inclusive) and the shape of the emitted object. The gate wants
`{"id":"2","amount":250}`: the id stays a string, the amount becomes a number,
and each line ends with `\n`.
