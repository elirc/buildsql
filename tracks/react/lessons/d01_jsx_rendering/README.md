# d01 — JSX and rendering (drill set)

Eight problems on the part of React that looks like HTML and is not: expressions
in braces, attributes that are props, one returned value, and text that stays
text. It draws on `01_components_jsx` — if you find yourself guessing at
`dateTime` versus `datetime` or at what `{}` will do with a string of markup, go
back and read that lesson before you fight the gate.

Nothing here has state, effects or events. Every component is a function from
props to markup, and every gate assertion is something a user could see or a
screen reader could announce.

## Exercise 1 — cents into a price line

Edit `ex1/solution.tsx`. `PriceTag({ label, cents })` renders one paragraph
reading exactly `<label> - $<amount>`, where the amount is `cents / 100` with two
decimal places: `PriceTag({ label: "Flat white", cents: 350 })` renders
`Flat white - $3.50`, and `cents: 0` renders `$0.00`.

```
uv run dojo test react d01_jsx_rendering ex1
```

## Exercise 2 — a picture with a caption

Edit `ex2/solution.tsx`. `Thumbnail({ src, alt, caption })` renders a `<figure>`
containing an `<img>` whose `src` is `src` and whose accessible name is `alt`,
followed by a `<figcaption>` showing `caption`. The image has to be *inside* the
figure.

```
uv run dojo test react d01_jsx_rendering ex2
```

## Exercise 3 — two siblings and a real date

Edit `ex3/solution.tsx`. `Byline({ author, isoDate, human })` returns exactly two
sibling elements and no wrapper:

- a `<span>` reading `By <author>`;
- a `<time>` showing `human` and carrying `isoDate` in its `datetime` attribute.

The gate renders it inside a `<p>` and counts that paragraph's direct children:
they must be `SPAN` then `TIME`.

```
uv run dojo test react d01_jsx_rendering ex3
```

## Exercise 4 — one percentage, two audiences

Edit `ex4/solution.tsx`. `ProgressMeter({ label, done, total })` renders a `<div>`
with `role="progressbar"`, named by `label`, carrying `aria-valuemin="0"`,
`aria-valuemax="100"` and an `aria-valuenow` holding the rounded percentage —
and showing that same percentage as text, as `38%`. A `total` of `0` is not an
error: the percentage is `0`.

```
uv run dojo test react d01_jsx_rendering ex4
```

## Exercise 5 — shorten it, sometimes

Edit `ex5/solution.tsx`. `Excerpt({ text, limit })` renders a paragraph. Text
whose length is `limit` or less is shown unchanged. Longer text is shown as its
first `limit` characters, with any trailing whitespace removed, followed by three
dots: `Coffee is a brewed drink` at `limit: 12` renders `Coffee is a...`.

```
uv run dojo test react d01_jsx_rendering ex5
```

## Exercise 6 — text that stays text

Edit `ex6/solution.tsx`. `LiteralNotice({ text })` renders a paragraph showing
`text` exactly as given — including any angle brackets in it. The gate passes a
string containing an `<a>` tag and then asserts that the document contains no
link. The stub does the wrong thing on purpose.

```
uv run dojo test react d01_jsx_rendering ex6
```

## Exercise 7 — a rating a screen reader can read

Edit `ex7/solution.tsx`. `StarRating({ rating, max })` renders `rating` asterisks
followed by `max - rating` dots — so `rating: 3, max: 5` shows `***..` — inside
an element that:

- has `role="img"` and an `aria-label` of `<rating> out of <max> stars` (always
  plural, even for one star);
- keeps the characters themselves out of the accessibility tree, with
  `aria-hidden="true"` on the element that holds them.

```
uv run dojo test react d01_jsx_rendering ex7
```

## Exercise 8 — the sortable column header

Edit `ex8/solution.tsx`. `SortHeader({ label, direction })` renders a
`<th scope="col">` holding a `<button>`, and:

- the button's **accessible name is exactly `label`** — an arrow next to it is
  hidden from assistive technology, and the button carries `type="button"`;
- the arrow is `^` when `direction` is `"asc"` and `v` when it is `"desc"`, and
  there is no arrow at all when `direction` was not passed;
- the `<th>` carries `aria-sort="ascending"` or `aria-sort="descending"` to
  match — and **no `aria-sort` attribute at all** when `direction` was not
  passed.

The gate renders it inside a `<table>`, because a `<th>` outside one is not a
column header.

```
uv run dojo test react d01_jsx_rendering ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/d01_jsx_rendering. Quoted verbatim in README.md.
import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { PriceTag } from "./ex1/solution";
import { Thumbnail } from "./ex2/solution";
import { Byline } from "./ex3/solution";
import { ProgressMeter } from "./ex4/solution";
import { Excerpt } from "./ex5/solution";
import { LiteralNotice } from "./ex6/solution";
import { StarRating } from "./ex7/solution";
import { SortHeader } from "./ex8/solution";

describe("d01_jsx_rendering", () => {
  test("ex1 - PriceTag turns a price in cents into one line of text", () => {
    const { rerender } = render(<PriceTag label="Flat white" cents={350} />);

    expect(
      screen.queryByText("Flat white - $3.50"),
      "the whole line has to read: Flat white - $3.50. Braces hold a JS " +
        "expression, so the division and the two decimal places happen inside " +
        "them - not in a variable the component forgot to use (README ex1)",
    ).not.toBeNull();

    rerender(<PriceTag label="Filter" cents={0} />);
    expect(
      screen.queryByText("Filter - $0.00"),
      "zero is a price too, and it still gets two decimal places",
    ).not.toBeNull();

    rerender(<PriceTag label="Beans" cents={12345} />);
    expect(
      screen.queryByText("Beans - $123.45"),
      "12345 cents is 123.45 dollars - dividing by 100 is the component's job",
    ).not.toBeNull();
  });

  test("ex2 - Thumbnail names the image and captions the figure", () => {
    render(
      <Thumbnail
        src="/img/roast.jpg"
        alt="A paper bag of coffee beans"
        caption="House roast, 250g"
      />,
    );

    const image = screen.queryByRole("img", { name: "A paper bag of coffee beans" });
    expect(
      image,
      "an image is found by its accessible name, which comes from alt. No alt " +
        "means no role of img at all, so this query returns nothing (README ex2)",
    ).not.toBeNull();
    expect(image, "and the src prop goes on the src attribute").toHaveAttribute(
      "src",
      "/img/roast.jpg",
    );

    const figure = screen.queryByRole("figure");
    expect(
      figure,
      "the picture and its caption belong to one another, and <figure> is the " +
        "element that says so - a <div> has no role and fails here",
    ).not.toBeNull();
    expect(
      within(figure!).queryByRole("img", { name: "A paper bag of coffee beans" }),
      "the image has to be inside the figure, not beside it",
    ).not.toBeNull();
    expect(figure, "and the caption text is in the figure too").toHaveTextContent(
      "House roast, 250g",
    );
  });

  test("ex3 - Byline returns two siblings and marks the date up as a date", () => {
    const { container } = render(
      <p>
        <Byline author="Ada Lovelace" isoDate="2024-03-02" human="2 March 2024" />
      </p>,
    );

    expect(screen.queryByText("By Ada Lovelace"), "the author line reads: By Ada Lovelace").not.toBeNull();

    const time = screen.queryByRole("time");
    expect(
      time,
      "a date shown to a human still needs a machine-readable form, which is " +
        "what <time> plus the dateTime prop is for (README ex3)",
    ).not.toBeNull();
    expect(
      time,
      "React writes the dateTime prop out as the datetime attribute - the " +
        "camelCase belongs in JSX, the lowercase in the DOM",
    ).toHaveAttribute("datetime", "2024-03-02");
    expect(time, "and the human form is what the reader sees").toHaveTextContent("2 March 2024");

    const paragraph = container.querySelector("p");
    expect(
      Array.from(paragraph?.children ?? []).map((element) => element.tagName),
      "the paragraph must hold exactly two children, a SPAN then a TIME. Any " +
        "extra wrapper element shows up here: a component returns one value, " +
        "and when that value is two siblings the value is a fragment",
    ).toEqual(["SPAN", "TIME"]);
  });

  test("ex4 - ProgressMeter reports one percentage twice, in text and in ARIA", () => {
    const { rerender } = render(<ProgressMeter label="Roasting" done={3} total={8} />);

    const bar = screen.queryByRole("progressbar", { name: "Roasting" });
    expect(
      bar,
      "role=progressbar plus aria-label is what makes this a progress bar to a " +
        "screen reader - a styled div announces nothing (README ex4)",
    ).not.toBeNull();
    expect(
      bar,
      "3 of 8 is 37.5 percent, and the rounded value belongs in aria-valuenow",
    ).toHaveAttribute("aria-valuenow", "38");
    expect(bar, "the scale is 0 to 100, stated on the element").toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar, "and the sighted reader gets the same number, as 38%").toHaveTextContent("38%");

    rerender(<ProgressMeter label="Roasting" done={8} total={8} />);
    expect(screen.getByRole("progressbar", { name: "Roasting" })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );

    rerender(<ProgressMeter label="Roasting" done={0} total={0} />);
    expect(
      screen.getByRole("progressbar", { name: "Roasting" }),
      "nothing to do is not an error and it is certainly not NaN - a total of " +
        "zero reports 0",
    ).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("progressbar", { name: "Roasting" })).toHaveTextContent("0%");
  });

  test("ex5 - Excerpt shortens long text and leaves short text alone", () => {
    const { rerender } = render(<Excerpt text="Short enough" limit={20} />);

    expect(
      screen.queryByText("Short enough"),
      "text inside the limit is shown exactly as it arrived, with nothing added",
    ).not.toBeNull();

    rerender(<Excerpt text="Roasted daily" limit={13} />);
    expect(
      screen.queryByText("Roasted daily"),
      "13 characters with a limit of 13 is not too long. Off-by-one lives here: " +
        "the test is longer than the limit, not as long as it (README ex5)",
    ).not.toBeNull();

    rerender(<Excerpt text="Coffee is a brewed drink" limit={16} />);
    expect(
      screen.queryByText("Coffee is a brew..."),
      "sixteen characters of Coffee is a brewed drink is Coffee is a brew, then " +
        "the three dots",
    ).not.toBeNull();

    rerender(<Excerpt text="Coffee is a brewed drink" limit={12} />);
    expect(
      screen.queryByText("Coffee is a..."),
      "twelve characters ends on a space, and a space before the dots is a " +
        "typographic bug - trim the end of the slice before adding them",
    ).not.toBeNull();
  });

  test("ex6 - LiteralNotice shows markup as text rather than running it", () => {
    render(<LiteralNotice text={'Use <a href="#docs">the docs</a> to check a flag'} />);

    expect(
      screen.queryByText('Use <a href="#docs">the docs</a> to check a flag'),
      "a string in braces is text, always. The angle brackets are characters " +
        "the reader should see, not an element for the browser to build " +
        "(README ex6)",
    ).not.toBeNull();
    expect(
      screen.queryByRole("link"),
      "there must be no link in the document. A link here means the string was " +
        "injected as HTML, which is how a user-supplied notice becomes a " +
        "cross-site scripting hole",
    ).toBeNull();
  });

  test("ex7 - StarRating draws the stars and names itself for a screen reader", () => {
    const { rerender } = render(<StarRating rating={3} max={5} />);

    const widget = screen.queryByRole("img", { name: "3 out of 5 stars" });
    expect(
      widget,
      "a picture made of characters is still a picture: role=img plus an " +
        "aria-label that says what it shows, in words (README ex7)",
    ).not.toBeNull();
    expect(
      widget,
      "three filled stars then two empty ones, as ***..",
    ).toHaveTextContent("***..");

    const glyphs = screen.queryByText("***..");
    expect(
      glyphs,
      "the row of characters must be hidden from assistive technology with " +
        "aria-hidden, or it gets read out as a pile of punctuation next to the " +
        "label that already said it",
    ).toHaveAttribute("aria-hidden", "true");

    rerender(<StarRating rating={0} max={3} />);
    expect(
      screen.queryByRole("img", { name: "0 out of 3 stars" }),
      "zero is a rating, and max is not always five",
    ).not.toBeNull();
    expect(screen.getByRole("img", { name: "0 out of 3 stars" })).toHaveTextContent("...");
  });

  test("ex8 - SortHeader reports how the column is sorted without renaming its button", () => {
    const { rerender } = render(
      <table>
        <thead>
          <tr>
            <SortHeader label="Price" />
          </tr>
        </thead>
      </table>,
    );

    expect(
      screen.queryByRole("columnheader"),
      "a column header is a th, and the element is what gives it the " +
        "columnheader role - a styled div inside a row is not a header " +
        "(README ex8)",
    ).not.toBeNull();
    expect(
      screen.getByRole("columnheader"),
      "an unsorted column carries no aria-sort at all. Absent and none are " +
        "different claims, and React leaves out an attribute whose value is " +
        "undefined - which is how you say the first one",
    ).not.toHaveAttribute("aria-sort");
    expect(
      screen.queryByRole("button", { name: "Price" }),
      "the header holds a button named exactly by the label",
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Price" }),
      "a button with no type submits the form it happens to be sitting in - " +
        "always say type=button unless you mean submit",
    ).toHaveAttribute("type", "button");

    rerender(
      <table>
        <thead>
          <tr>
            <SortHeader label="Price" direction="asc" />
          </tr>
        </thead>
      </table>,
    );
    expect(
      screen.getByRole("columnheader"),
      "ARIA spells this one out in full: ascending, not asc",
    ).toHaveAttribute("aria-sort", "ascending");
    expect(
      screen.queryByText("^"),
      "the arrow is decoration beside a label that already says everything, " +
        "so it is hidden from assistive technology",
    ).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.queryByRole("button", { name: "Price" }),
      "and the name is still exactly Price - an arrow that reaches the name " +
        "turns the column into Price ^ for anyone listening",
    ).not.toBeNull();

    rerender(
      <table>
        <thead>
          <tr>
            <SortHeader label="Price" direction="desc" />
          </tr>
        </thead>
      </table>,
    );
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "descending");
    expect(
      screen.queryByText("v"),
      "the other direction gets the other arrow, hidden the same way",
    ).toHaveAttribute("aria-hidden", "true");
  });
});
```

<!-- GATE:END -->

Next: **d02_components_props**, where the props themselves get interesting.
