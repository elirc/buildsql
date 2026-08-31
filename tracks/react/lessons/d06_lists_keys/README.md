# d06 — Lists and keys (drill set)

Eight problems on turning arrays into markup: mapping, filtering, ordering, the
empty case, and the one thing that goes wrong quietly — keys. It drills
`04_lists_conditional`; if the phrase "key by identity, not by position" does not
already mean something specific to you, reread that lesson first.

Four of these can be passed by code that looks correct and is not. Two of them
mutate data they were handed, and two of them lose a user's typing when the list
moves. That is the point of the set: the bug never appears until the list
changes, and then it appears in production.

## Exercise 1 — the ordered list

Edit `ex1/solution.tsx`. `RecipeSteps({ steps })` renders an `<ol>` with one
`<li>` per step, in the order given, with no missing-key warning in the console.

```
uv run dojo test react d06_lists_keys ex1
```

## Exercise 2 — rank without disturbing

Edit `ex2/solution.tsx`. `HighScores({ scores })` renders a list, highest
`points` first, each item reading `<name> - <points>`. The gate checks the array
you were handed afterwards: it must still be in the order the caller left it in.

```
uv run dojo test react d06_lists_keys ex2
```

## Exercise 3 — only the ones aimed at you

Edit `ex3/solution.tsx`. `Mentions({ messages, me })` lists the `text` of every
message containing `@<me>`, in their original order. When none match, there is no
list at all — just a paragraph reading `No mentions yet`.

```
uv run dojo test react d06_lists_keys ex3
```

## Exercise 4 — the sort that steals a note

Edit `ex4/solution.tsx`. `SortableRoster({ people })` renders one `<li>` per
person, each with a label showing the name and an **uncontrolled** note box
(`defaultValue=""`) wired to that label, plus a `Sort by name` button that puts
the rows in alphabetical order. Type a note into one row, sort, and the note must
still belong to the same person.

```
uv run dojo test react d06_lists_keys ex4
```

## Exercise 5 — two elements, one key

Edit `ex5/solution.tsx`. `Glossary({ entries })` renders a `<dl>` whose direct
children are `<dt>`, `<dd>`, `<dt>`, `<dd>` — the term then the definition for
each entry, with no wrapper element between the `<dl>` and them, and no
missing-key warning.

```
uv run dojo test react d06_lists_keys ex5
```

## Exercise 6 — the byline

Edit `ex6/solution.tsx`. `AuthorLine({ names })` renders a paragraph:
`Unknown author` for none, the bare name for one, `Ada and Bo` for two, and
`Ada, Bo and Cy` (commas until the last, which gets the `and`) for three or more.

```
uv run dojo test react d06_lists_keys ex6
```

## Exercise 7 — edit in place, immutably

Edit `ex7/solution.tsx`. `EditableList({ initialItems })` renders one row per
item, each showing its text and an `Edit <text>` button. Clicking Edit turns that
row — and only that row — into an input named `Item text` holding the current
text, with `Save` and `Cancel` buttons. Opening a second row closes the first.
`Save` shows the new text; `Cancel` restores the old one. The item objects the
caller passed in must never change.

```
uv run dojo test react d06_lists_keys ex7
```

## Exercise 8 — the filter that moves a tick

Edit `ex8/solution.tsx`. `SearchableChecklist({ items })` renders a text box
labelled `Filter` and one **uncontrolled** checkbox per item, labelled by the
item, showing only items whose label contains the filter text (case-insensitive).
Tick a box, filter the list, and the tick must still be on the item you ticked —
while it is filtered, and after the filter is cleared.

```
uv run dojo test react d06_lists_keys ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/d06_lists_keys. Quoted verbatim in README.md.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { RecipeSteps } from "./ex1/solution";
import { HighScores } from "./ex2/solution";
import { Mentions } from "./ex3/solution";
import { SortableRoster } from "./ex4/solution";
import { Glossary } from "./ex5/solution";
import { AuthorLine } from "./ex6/solution";
import { EditableList } from "./ex7/solution";
import { SearchableChecklist } from "./ex8/solution";

describe("d06_lists_keys", () => {
  test("ex1 - RecipeSteps numbers the steps in the order it was handed", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <RecipeSteps steps={["Heat the pan", "Melt the butter", "Add the eggs"]} />,
    );

    expect(
      container.querySelector("ol"),
      "the order of these steps is meaning, not styling, so the list has to be " +
        "an <ol>. A <ul> renders the same words and tells a screen reader " +
        "something false (README ex1)",
    ).not.toBeNull();
    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "one list item per step, in the order they arrived - map over the array " +
        "and return an element for each entry",
    ).toEqual(["Heat the pan", "Melt the butter", "Add the eggs"]);
    expect(
      errors.mock.calls.flat().join(" "),
      "React logged its missing-key warning. Every element produced by a map " +
        "needs a key, so React can tell one item from another between renders",
    ).not.toMatch(/unique "key"/);
  });

  test("ex2 - HighScores ranks a copy and leaves the array it was given alone", () => {
    const scores = [
      { name: "Bo", points: 12 },
      { name: "Ada", points: 21 },
      { name: "Cy", points: 30 },
    ];
    const before = scores.map((score) => score.name).join(",");

    render(<HighScores scores={scores} />);

    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "highest points first, each line reading name - points",
    ).toEqual(["Cy - 30", "Ada - 21", "Bo - 12"]);
    expect(
      scores.map((score) => score.name).join(","),
      "the array the caller passed in came back in a different order. Both " +
        "sort() and reverse() rearrange the array they are called on, and a " +
        "prop belongs to whoever passed it - copy before you reorder " +
        "(README ex2)",
    ).toBe(before);
  });

  test("ex3 - Mentions lists only the messages aimed at you", () => {
    const messages = [
      { id: "m1", text: "@ada can you review this" },
      { id: "m2", text: "shipping the release now" },
      { id: "m3", text: "thanks @bo and @ada" },
    ];
    const { rerender } = render(<Mentions messages={messages} me="ada" />);

    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "only the messages containing @ada belong in the list, and they keep the " +
        "order they arrived in - filter, then map (README ex3)",
    ).toEqual(["@ada can you review this", "thanks @bo and @ada"]);

    rerender(<Mentions messages={messages} me="cy" />);
    expect(
      screen.queryAllByRole("listitem").length,
      "nobody mentioned cy, so there are no list items at all",
    ).toBe(0);
    expect(
      screen.queryByRole("list"),
      "and no empty list either - an empty <ul> is a box with nothing in it, " +
        "which a screen reader still announces as a list of 0 items",
    ).toBeNull();
    expect(
      screen.queryByText("No mentions yet"),
      "the empty case still owes the reader a sentence: No mentions yet",
    ).not.toBeNull();
  });

  test("ex4 - SortableRoster keeps each note in the row it was typed into", async () => {
    const user = userEvent.setup();
    render(
      <SortableRoster
        people={[
          { id: "zoe", name: "Zoe" },
          { id: "ada", name: "Ada" },
          { id: "bo", name: "Bo" },
        ]}
      />,
    );

    expect(screen.queryAllByRole("textbox").length, "one note box per person").toBe(3);

    await user.type(screen.getByLabelText("Zoe"), "on leave");
    expect(screen.getByLabelText("Zoe"), "typing lands in the box you typed into").toHaveValue(
      "on leave",
    );

    await user.click(screen.getByRole("button", { name: "Sort by name" }));

    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "Sort by name puts the three rows in alphabetical order",
    ).toEqual(["Ada", "Bo", "Zoe"]);
    expect(
      screen.getByLabelText("Zoe"),
      "the note stayed at the top of the screen instead of following Zoe down " +
        "to the bottom. Keyed by position, React reused the input that was " +
        "already sitting in row 0 and only swapped the label around it, so an " +
        "uncontrolled box kept a value that belongs to somebody else. Key by " +
        "identity (README ex4)",
    ).toHaveValue("on leave");
    expect(
      screen.getByLabelText("Ada"),
      "and Ada, whose box was never typed into, still has an empty one",
    ).toHaveValue("");
  }, 30000);

  test("ex5 - Glossary pairs each term with its definition and keys the pair", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <Glossary
        entries={[
          { id: "props", term: "Props", definition: "What a component is handed" },
          { id: "state", term: "State", definition: "What a component remembers" },
        ]}
      />,
    );

    expect(
      screen.queryAllByRole("term").map((el) => el.textContent),
      "one <dt> per entry, holding the term",
    ).toEqual(["Props", "State"]);
    expect(
      screen.queryAllByRole("definition").map((el) => el.textContent),
      "one <dd> per entry, holding the definition",
    ).toEqual(["What a component is handed", "What a component remembers"]);

    const list = container.querySelector("dl");
    expect(
      Array.from(list?.children ?? []).map((el) => el.tagName),
      "the <dl> has to hold DT DD DT DD directly. Wrapping each pair in a <div> " +
        "is the usual escape from the keying problem, and it is invalid markup " +
        "that costs the definition-list semantics (README ex5)",
    ).toEqual(["DT", "DD", "DT", "DD"]);
    expect(
      errors.mock.calls.flat().join(" "),
      "React logged its missing-key warning. Two elements per entry and no " +
        "wrapper means the key goes on a Fragment - written out by name, " +
        "because the <> shorthand cannot take props",
    ).not.toMatch(/unique "key"/);
  });

  test("ex6 - AuthorLine reads like a sentence at every length", () => {
    const { rerender } = render(<AuthorLine names={[]} />);
    expect(
      screen.queryByText("Unknown author"),
      "a byline with nobody in it still has to say something (README ex6)",
    ).not.toBeNull();

    rerender(<AuthorLine names={["Ada"]} />);
    expect(screen.queryByText("Ada"), "one name is just the name").not.toBeNull();

    rerender(<AuthorLine names={["Ada", "Bo"]} />);
    expect(
      screen.queryByText("Ada and Bo"),
      "two names are joined by and, with no comma in front of it",
    ).not.toBeNull();

    rerender(<AuthorLine names={["Ada", "Bo", "Cy"]} />);
    expect(
      screen.queryByText("Ada, Bo and Cy"),
      "three or more are comma-separated until the last, which gets the and",
    ).not.toBeNull();

    rerender(<AuthorLine names={["Ada", "Bo", "Cy", "Dee"]} />);
    expect(screen.queryByText("Ada, Bo, Cy and Dee"), "and it holds at four").not.toBeNull();
  });

  test("ex7 - EditableList edits one row at a time and never edits its props", async () => {
    const user = userEvent.setup();
    const items = [
      { id: "a", text: "Buy milk" },
      { id: "b", text: "Call Ada" },
    ];

    render(<EditableList initialItems={items} />);

    await user.click(screen.getByRole("button", { name: "Edit Buy milk" }));
    expect(
      screen.queryAllByRole("textbox").length,
      "Edit swaps exactly one row into an input; the other row stays as text " +
        "(README ex7)",
    ).toBe(1);
    expect(
      screen.getByRole("textbox", { name: "Item text" }),
      "the input opens with the text that was on that row",
    ).toHaveValue("Buy milk");

    await user.click(screen.getByRole("button", { name: "Edit Call Ada" }));
    expect(
      screen.queryAllByRole("textbox").length,
      "opening a second row closes the first. One editing id in state answers " +
        "this for free; one flag per row does not",
    ).toBe(1);
    expect(screen.getByRole("textbox", { name: "Item text" })).toHaveValue("Call Ada");

    await user.clear(screen.getByRole("textbox", { name: "Item text" }));
    await user.type(screen.getByRole("textbox", { name: "Item text" }), "Call Ada back");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.queryAllByRole("textbox").length, "Save closes the editor").toBe(0);
    expect(
      screen.queryByText("Call Ada back"),
      "and the row now shows the edited text",
    ).not.toBeNull();
    expect(
      items[1].text,
      "the object the caller passed in was rewritten in place. State updates " +
        "replace, they do not edit: map the list and hand back a new object for " +
        "the row that changed",
    ).toBe("Call Ada");

    await user.click(screen.getByRole("button", { name: "Edit Buy milk" }));
    await user.clear(screen.getByRole("textbox", { name: "Item text" }));
    await user.type(screen.getByRole("textbox", { name: "Item text" }), "Buy oat milk");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByText("Buy milk"),
      "Cancel throws the draft away and leaves the row as it was",
    ).not.toBeNull();
    expect(screen.queryByText("Buy oat milk"), "the abandoned draft is gone").toBeNull();
  }, 30000);

  test("ex8 - SearchableChecklist keeps every tick on the item that was ticked", async () => {
    const user = userEvent.setup();
    render(
      <SearchableChecklist
        items={[
          { id: "milk", label: "Milk" },
          { id: "sourdough", label: "Sourdough" },
          { id: "eggs", label: "Eggs" },
        ]}
      />,
    );

    await user.click(screen.getByLabelText("Sourdough"));
    expect(screen.getByLabelText("Sourdough"), "clicking a box ticks it").toBeChecked();

    await user.type(screen.getByLabelText("Filter"), "g");

    expect(
      screen.queryAllByRole("checkbox").length,
      "only Sourdough and Eggs contain a g, so two rows are left",
    ).toBe(2);
    expect(
      screen.getByLabelText("Sourdough"),
      "the tick jumped to a different item the moment the list was filtered. " +
        "Keyed by position, React reused row 0 - which was Milk, unticked - for " +
        "Sourdough, and the checkbox is uncontrolled, so its ticked state lives " +
        "in the DOM node that got reused. Key by identity (README ex8)",
    ).toBeChecked();
    expect(
      screen.getByLabelText("Eggs"),
      "and Eggs, which nobody ticked, is still empty",
    ).not.toBeChecked();

    await user.clear(screen.getByLabelText("Filter"));

    expect(
      screen.queryAllByRole("checkbox").length,
      "clearing the filter brings all three rows back",
    ).toBe(3);
    expect(screen.getByLabelText("Sourdough"), "Sourdough is still the ticked one").toBeChecked();
    expect(screen.getByLabelText("Milk")).not.toBeChecked();
    expect(screen.getByLabelText("Eggs")).not.toBeChecked();
  }, 30000);
});
```

<!-- GATE:END -->

Next: **d07_conditional_ui**, where the question is what to render rather than
how many of them.
