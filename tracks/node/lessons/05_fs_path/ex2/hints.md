## Hint 1

Import from `node:fs/promises`, not `node:fs`. The callback API and the
promise API live in different modules, and mixing them up is the most common
"why is this undefined" in a first fs program.

`writeJson` has three jobs in order: make sure the directory exists, turn the
data into text, write the text. `readJson` has two: read the text, turn it
back into data.

## Hint 2

`mkdir(dir, { recursive: true })` creates every missing level and does *not*
fail if the directory is already there - which is why it replaced the
`if (!existsSync) mkdir` dance you may have seen. The directory you need is
`path.dirname(file)`.

`JSON.stringify(data, null, 2)` is the readable form: `null` for the replacer,
`2` for the indent. It does not add a trailing newline, so you add one.

`readFile(file, "utf8")` gives you a string; without the encoding argument it
gives you a `Buffer`, which `JSON.parse` will coerce - but be explicit.

## Hint 3

```ts
export async function writeJson(file: string, data: unknown): Promise<void> {
  await mkdir(/* which directory? */, { recursive: true });
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
```

The decisions left to you: which directory to create, and what `readJson`
does about types. It is declared `Promise<T>` but `JSON.parse` returns `any` -
the cast is you promising the compiler something you have not checked. That is
honest here and a real risk in production, where the answer is a schema
validator (zod, in lesson 10) rather than a cast.
