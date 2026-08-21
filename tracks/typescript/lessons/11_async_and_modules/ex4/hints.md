## Hint 1

Two files, and only one of them contains logic. `legacy.js` is real JavaScript
that already works; `legacy.d.ts` is your description of it, and it is missing
the export you need. Open `legacy.js`, read what it exports, and describe the
second one.

Then use it in `solution.ts` to build a lesson slug.

## Hint 2

A declaration file describes shapes without implementing them:

```ts
export declare function helper(input: string): number;
export declare const NAME: string;
```

There are no bodies, and nothing is emitted - a `.d.ts` is pure description.
TypeScript finds `legacy.d.ts` automatically when something imports
`./legacy.js`, which is exactly how every `@types/*` package works.

For the slug: two digits, an underscore, then the slugified title. `padStart`
is the string method that gets you `04` from `4`.

## Hint 3

Add `export declare function slugify(title: string): string;` to
`legacy.d.ts`, import it in `solution.ts`, and return
`` `${String(index).padStart(2, "0")}_${slugify(title)}` ``.

Left to you: your declaration is a *claim* about code you did not write, and
nothing checks it. Look at what `slugify` does with a number, then decide
whether `title: string` is a description or a wish - and which one you would
want a teammate to write.
