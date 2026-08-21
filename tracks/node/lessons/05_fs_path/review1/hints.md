## Hint 1

Two parts, and you have written both before in this lesson.

Finding out what is already in the directory: one `readdir` call gives you the
names. Putting them in a `Set` makes "is this taken?" a single fast check, and
you only need to read the directory once.

Taking a name apart so the counter lands in the right place: `path.parse`,
same as ex1. `report.json` has to become `report-1.json`, so the suffix goes
between the stem and the extension.

## Hint 2

The loop is "try 1, try 2, try 3 until one is free". A `for` loop with no end
condition and a `return` inside it is the honest shape here - the exit is
finding a free name, not exhausting a range.

Watch the no-extension case: `path.parse("LICENSE")` gives
`{ name: "LICENSE", ext: "" }`, so the template
`` `${stem}-${suffix}${ext}` `` produces `LICENSE-1` with no trailing dot. If
you build the name by string surgery around the last dot instead, that case is
where it breaks.

## Hint 3

```ts
const taken = new Set(await readdir(dir));
if (!taken.has(name)) return name;

const { name: stem, ext } = path.parse(name);
for (let suffix = 1; ; suffix += 1) {
  const candidate = /* build it */;
  if (!taken.has(candidate)) return candidate;
}
```

The decision left to you is the candidate template. One honest caveat worth
knowing: between your `readdir` and whoever actually writes the file, another
process could take the name - a time-of-check-to-time-of-use race. The real
fix is to open the file with the exclusive flag (`fs.open(file, "wx")`) and
retry on `EEXIST`, and knowing that this class of bug has a name is most of
the value of the exercise.
