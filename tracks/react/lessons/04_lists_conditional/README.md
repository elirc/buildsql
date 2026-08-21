# 04 — Lists, keys and conditionals

Almost everything on a screen is a list. A table of orders, a row of tags, a
feed, a set of radio buttons, the options in a dropdown — all lists, all
rendered from arrays, all subject to the same rule. And that rule, `key`, is
the most consequential prop in React and the one most often got wrong.

Here is the situation React is in. It rendered three rows last time. It is
about to render four. Some of the new rows are the old rows moved, some are
genuinely new, and its job is to work out which is which so it can reuse the
DOM it already built — and, crucially, so it knows which *component instances*
survive. Component instances hold state. Uncontrolled inputs hold what the user
typed. Focus lives on one specific element. If React guesses wrong about which
row is which, all three end up attached to the wrong data.

React does not guess. It asks you, and `key` is your answer. When you leave it
out, React falls back to position, warns you in the console, and behaves
correctly right up until the list changes order — at which point it produces
one of the most confusing bug classes in the framework. Exercise 2 makes it
happen to you on purpose, because reading about it does not stick.

The other half of this lesson is conditional rendering, which is easy except
for one trap that everybody falls into exactly once. It involves the number
zero.

## Concept — mapping, keying, and choosing not to render

**Arrays are renderable.** React renders each element of an array in turn, so
turning data into UI is `.map()`:

```tsx
<ul>
  {books.map((book) => (
    <li key={book.isbn}>{book.title}</li>
  ))}
</ul>
```

**A key identifies an item, not a position.** It must be:

- **unique among siblings** (not globally — two different lists may both use
  key `"1"`),
- **stable across renders** — the same item gets the same key every time,
- **derived from the data**, not from where the item happens to sit.

Which rules out the two tempting shortcuts. `key={index}` is position, not
identity: prepend an item and every key now points at a different thing.
`key={Math.random()}` is unique but not stable: every render is a completely
new set of items, so React throws away and rebuilds the entire list every time,
destroying state and focus with it.

What React does with a wrong key is precise and worth picturing. With
`key={index}`, inserting `Zoe` at the front of `[Ada, Lin]` produces keys
`0,1,2` on both sides. React concludes row `0` is the same row it had before —
it just changed its name from Ada to Zoe — and **reuses that DOM node**.
Everything React manages (text, attributes) gets updated. Everything the *DOM*
manages (an uncontrolled input's value, focus, scroll position, a playing
`<video>`) stays exactly where it was, which is now the wrong row. With
`key={person.id}` React sees `zoe` is new, `ada` and `lin` moved, and moves the
existing nodes instead of repainting them.

If your data genuinely has no id, the fix is to give it one *where it is
created* — when you generate the row, when you parse the response — not at
render time, because a key invented during render is new on every render.

**Conditional rendering** has three forms and one trap:

```tsx
if (items.length === 0) return <Empty />;      // whole component
{isAdmin ? <Edit /> : <View />}                // either/or
{hasErrors && <ErrorSummary />}                // show or nothing
```

React renders nothing for `false`, `null` and `undefined`. It does **not**
render nothing for `0`, `""` or `NaN` — those are falsy in JavaScript but
perfectly renderable values, and React prints them. So:

```tsx
{unreadCount && <Badge count={unreadCount} />}   // renders "0" when empty
{unreadCount > 0 && <Badge count={unreadCount} />}  // renders nothing
```

That stray `0` on the page is one of the most-reported React bugs of all time,
and the fix is always the same: make the left-hand side an actual boolean.

**Derive, do not store.** A sorted or filtered list is a *view* of your data,
so compute it during render rather than keeping a second copy in state — the
same "keep the source, derive the view" rule from lesson 03. One caution while
you do: `Array.prototype.sort` and `reverse` mutate the array they are called
on. Sorting a prop is quietly rewriting data that belongs to somebody else.

## Exercise 1 — map an array

Edit `ex1/solution.tsx`. `TagList({ tags })` renders a `<ul>` with one `<li>`
per tag, in the given order, each showing just the tag. The gate also spies on
`console.error` and fails if React logged its missing-key warning.

```
uv run dojo test react 04_lists_conditional ex1
```

## Exercise 2 — the bug that keys exist to prevent

Edit `ex2/solution.tsx`. This one is different: the component is **already
written and already works**. It renders a row per person, each with a label and
an uncontrolled text box, and a button that adds a newcomer to the front of the
list.

The gate types `hello` into Ada's box, clicks `Add to front`, and then checks
that Ada's box still says `hello`. Run it before you change anything and watch
where the text ended up.

```
uv run dojo test react 04_lists_conditional ex2
```

The fix is one expression long. Understanding why it is the fix is the exercise.

## Exercise 3 — the empty state, and the zero

Edit `ex3/solution.tsx`. `Inbox({ messages, unreadCount })`:

- when `messages` is empty, render the text `No messages` and **no list at
  all**;
- otherwise render a `<ul>` with one `<li>` per message showing its `subject`;
- show a badge reading `<count> unread` — for example `2 unread` — but only
  when `unreadCount` is above zero, and with **no stray `0`** anywhere in the
  output when it is not.

The stub renders the badge unconditionally, so start there.

```
uv run dojo test react 04_lists_conditional ex3
```

## Exercise 4 — derive a view without disturbing the data

Edit `ex4/solution.tsx`. `Leaderboard({ players })` renders an `<ol>` of the
**top three** players, highest score first, ties broken by name A–Z, each item
reading `Name: score` — for example `Cy: 30`.

The gate checks the rendered order and then checks the array it passed in is
still in its original order. Sorting a prop in place is the mistake it is
looking for.

```
uv run dojo test react 04_lists_conditional ex4
```

## Challenge — grouping

Edit `challenge/solution.tsx`. `GroupedTasks({ tasks })` renders the tasks
grouped by status. The file already exports `GROUPS`, which gives you the three
statuses in display order along with their labels. For each group **that has at
least one task**, render a level-3 heading with the label and a list of that
group's task titles, sorted A–Z. Groups with no tasks must not appear at all —
not as an empty heading, not as an empty list.

Honest difficulty note: no new API, but two nested maps, two sets of keys, and
a `null` returned from inside a `map`. Take it in the order the hints suggest.

```
uv run dojo test react 04_lists_conditional challenge
```

## Review — removing the right item

`review1/solution.tsx`. `Chips({ items })` holds the items in state and renders
one `<li>` per chip containing a button reading `Remove <label>`. Clicking a
button removes that chip and no other.

```
uv run dojo test react 04_lists_conditional review1
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/04_lists_conditional. Quoted verbatim in README.md.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { TagList } from "./ex1/solution";
import { PeopleList } from "./ex2/solution";
import { Inbox } from "./ex3/solution";
import { Leaderboard } from "./ex4/solution";
import { GroupedTasks } from "./challenge/solution";
import { Chips } from "./review1/solution";

describe("04_lists_conditional", () => {
  test("ex1 - TagList renders one list item per tag, with keys", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<TagList tags={["react", "jsx", "hooks"]} />);

    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "one <li> per tag, in the order they were given - map over the array and " +
        "return an element for each item (README ex1)",
    ).toEqual(["react", "jsx", "hooks"]);
    expect(
      errors.mock.calls.flat().join(" "),
      "React logged its missing-key warning. Every element produced by a map " +
        "needs a key prop so React can tell the items apart between renders",
    ).not.toMatch(/unique "key"/);
  });

  test("ex2 - PeopleList keeps each row attached to its own person", async () => {
    const user = userEvent.setup();
    render(
      <PeopleList
        initialPeople={[
          { id: "ada", name: "Ada" },
          { id: "lin", name: "Lin" },
        ]}
        newcomer={{ id: "zoe", name: "Zoe" }}
      />,
    );

    await user.type(screen.getByLabelText("Ada"), "hello");
    expect(screen.getByLabelText("Ada"), "typing should land in Ada's box").toHaveValue("hello");

    await user.click(screen.getByRole("button", { name: "Add to front" }));

    expect(
      screen.queryAllByRole("textbox").length,
      "after adding a person there should be three boxes",
    ).toBe(3);
    expect(
      screen.getByLabelText("Ada"),
      "Ada's box lost what you typed into it, and the text is now sitting in " +
        "somebody else's row. React reused the DOM node that used to be first " +
        "because the key said the two rows were the same thing. Key by identity, " +
        "not by position - reread README ex2",
    ).toHaveValue("hello");
    expect(
      screen.getByLabelText("Zoe"),
      "the newcomer's box must start empty - it is a brand new row",
    ).toHaveValue("");
  }, 20000);

  test("ex3 - Inbox handles the empty case without leaking a zero", () => {
    const empty = render(<Inbox messages={[]} unreadCount={0} />);

    expect(
      screen.queryByRole("list"),
      "an empty inbox should render an empty state, not an empty list",
    ).toBeNull();
    expect(
      screen.queryByText("No messages"),
      "an empty inbox needs to say so - the text must read exactly: No messages",
    ).not.toBeNull();
    expect(
      empty.container.textContent,
      "a stray 0 reached the DOM. {count && <Badge/>} evaluates to the number 0 " +
        "when count is 0, and React renders 0 - it only skips false, null and " +
        "undefined. Compare against 0 explicitly (README ex3)",
    ).not.toMatch(/0/);
    empty.unmount();

    render(
      <Inbox
        messages={[
          { id: "1", subject: "Invoice" },
          { id: "2", subject: "Welcome" },
        ]}
        unreadCount={2}
      />,
    );
    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "a non-empty inbox lists its subjects in order",
    ).toEqual(["Invoice", "Welcome"]);
    expect(
      screen.queryByText("2 unread"),
      "with unread messages the badge shows, reading exactly: 2 unread",
    ).not.toBeNull();
  });

  test("ex4 - Leaderboard shows the top three without touching its props", () => {
    const players = [
      { name: "Ada", score: 12 },
      { name: "Lin", score: 30 },
      { name: "Zoe", score: 12 },
      { name: "Bo", score: 7 },
      { name: "Cy", score: 30 },
    ];
    const before = players.map((p) => p.name).join(",");

    render(<Leaderboard players={players} />);

    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "highest score first, ties broken by name A-Z, and only the top three - " +
        "expected Cy: 30, Lin: 30, Ada: 12",
    ).toEqual(["Cy: 30", "Lin: 30", "Ada: 12"]);
    expect(
      players.map((p) => p.name).join(","),
      "the props array came back reordered. Array.prototype.sort() sorts in " +
        "place, so sorting a prop mutates data you do not own - copy it first " +
        "(README ex4)",
    ).toBe(before);
  });

  test("challenge - GroupedTasks groups, orders and skips empty groups", () => {
    render(
      <GroupedTasks
        tasks={[
          { id: "3", title: "Ship it", status: "done" },
          { id: "1", title: "Write the gate", status: "todo" },
          { id: "2", title: "Author the README", status: "todo" },
          { id: "4", title: "Archive", status: "done" },
        ]}
      />,
    );

    expect(
      screen.queryAllByRole("heading", { level: 3 }).map((h) => h.textContent),
      "one level-3 heading per non-empty group, in the fixed order To do, " +
        "Doing, Done. No task has status doing here, so that group must not " +
        "appear at all (README challenge)",
    ).toEqual(["To do", "Done"]);

    const lists = screen.queryAllByRole("list");
    expect(lists.length, "each group owns one list").toBe(2);
    expect(
      within(lists[0]).queryAllByRole("listitem").map((li) => li.textContent),
      "inside a group the titles are sorted A-Z",
    ).toEqual(["Author the README", "Write the gate"]);
    expect(
      within(lists[1]).queryAllByRole("listitem").map((li) => li.textContent),
      "the done group holds its own two tasks, also A-Z",
    ).toEqual(["Archive", "Ship it"]);
  });

  test("review1 - Chips removes the chip you asked for and no other", async () => {
    const user = userEvent.setup();
    render(
      <Chips
        items={[
          { id: "a", label: "alpha" },
          { id: "b", label: "beta" },
          { id: "c", label: "gamma" },
        ]}
      />,
    );

    expect(screen.queryAllByRole("listitem").length, "three chips to start").toBe(3);

    await user.click(screen.getByRole("button", { name: "Remove beta" }));
    expect(
      screen.queryAllByRole("button").map((b) => b.textContent),
      "only beta should be gone. If the wrong chip disappeared, the handler is " +
        "removing by position instead of by id",
    ).toEqual(["Remove alpha", "Remove gamma"]);

    await user.click(screen.getByRole("button", { name: "Remove alpha" }));
    expect(
      screen.queryAllByRole("listitem").length,
      "removing a second chip must leave exactly one - filter returns a new " +
        "array, splice mutates the one you are holding and React sees no change",
    ).toBe(1);
  });
});
```

<!-- GATE:END -->

In plain English:

- **ex1** collects the text of every `listitem` and compares the array, then
  reads back everything `console.error` was called with and fails if React's
  missing-key warning is in there. The spy is restored automatically between
  tests.
- **ex2** types into the box labelled `Ada`, adds a person to the front, and
  then asks the DOM again for "the box labelled Ada". With index keys that box
  is a *different DOM node* than the one holding the typed text.
- **ex3** renders empty, asserts there is no `list` role and that the empty
  text is present, and then checks the whole rendered text contains no digit
  `0`. Then it renders two messages and checks the items and the badge.
- **ex4** snapshots the input array's order before rendering and compares it
  afterwards — that assertion is entirely about `sort` mutating in place.
- **challenge** compares the level-3 headings as an array (which catches both
  wrong order and a group that should have been skipped), then scopes into each
  list with `within` and compares its items.
- **review1** clicks one remove button and compares the *remaining buttons* by
  their text, which catches removing the wrong item, then removes a second and
  counts what is left.

## The teaching point

Keys are React's way of asking you a question it genuinely cannot answer:
"which of these is which?" Position is not identity — a list that never
reorders makes them look the same, which is why index keys survive so long in
so many codebases before failing spectacularly. If you have written SQL, you
have already internalised this distinction: a primary key identifies a row no
matter where it sits in the result set, and nobody would dream of joining on
row number.

The conditional-rendering half is smaller but pays immediately. `&&` renders
its left operand when that operand is falsy-but-renderable, and the fix —
compare explicitly — takes four characters. Once you have shipped a stray `0`
to production you will never write it again; this lesson is an attempt to save
you the trip.

Next: **05_forms**, where the DOM wants to own state and you take it back.
