# i2 — Interview drills

These are the tasks. Not questions about React — things an interviewer hands you
a blank editor and forty minutes for, or pairs with you on while watching how
you work.

Each drill is written the way it would be said to you, with a **time-box**. The
time-box is not a target to beat; it is there so you find out where you actually
are. A drill you cannot finish in twice its box is a lesson to redo, and each
one names which.

Two things are being assessed in a live version of these, and only one of them is
the code. The other is how you work: whether you restate the problem before
typing, whether you name the state out loud, whether you say "I'd normally reach
for TanStack Query here, but let me show you the manual version", whether you
notice the accessibility requirement without being prompted. Practise the
narration along with the code — talk to the empty room. It feels ridiculous and
it is the highest-value thing on this page.

Every drill takes its data source as a **prop**, as always, so nothing here
touches the network.

A note on the gates. Drills with timers are driven with `fireEvent.change`
rather than `user-event`, because `user-event` waits on real timers and mixing
that with fake ones produces a test that passes on your machine and fails on a
slow one. Where there are no timers, it is `user-event` as usual.

## Drill 1 — the debounced search box · ~12 minutes

Edit `ex1/solution.tsx`.

> *"Here's a `search` function that returns a promise of results. Build me a
> search box. Don't fire a request on every keystroke."*

`DebouncedSearch({ search })` renders an input labelled `Search` and a list of
results, and:

- waits **300ms after the typing stops** before calling `search`;
- calls it **once** for a burst of typing, with the final value;
- does not call it at all for an empty box, and shows no results then;
- never lets an older response replace a newer one.

That last requirement is not in the prompt. Interviewers leave it out on
purpose. *(Weak here → redo `10_custom_hooks` and `07_data_fetching`.)*

```
uv run dojo test react i2_interview_drills ex1
```

## Drill 2 — the paginated list · ~15 minutes

Edit `ex2/solution.tsx`.

> *"`fetchPage(n)` gives you `{ items, total }`. Page through it, two at a
> time."*

`PagedList({ fetchPage, pageSize })`:

- loads page 1 on mount and lists the items;
- a live region reads `Page 1 of 3` — the page count comes from `total` and
  `pageSize`;
- `Previous` and `Next` move one page and are disabled at the ends;
- only the current page's items are on screen.

*(Weak here → redo `07_data_fetching`.)*

```
uv run dojo test react i2_interview_drills ex2
```

## Drill 3 — the validated form · ~15 minutes

Edit `ex3/solution.tsx`.

> *"Two fields, display name and email. Don't let a bad one through, and tell
> the user what's wrong — properly, not just red borders."*

`ProfileForm({ onSubmit })`:

- display name must be at least 2 characters, message
  `Display name must be at least 2 characters`;
- email must contain an `@`, message `Enter a valid email address`;
- **no errors before the first submit attempt**; after one, each broken field
  carries `aria-invalid="true"` and has its message as its accessible
  description, and each valid field carries `aria-invalid="false"`;
- once a submit has been attempted, fixing a field clears its error **as the
  user types**;
- `onSubmit` gets `{ displayName, email }` only when everything is valid.

*(Weak here → redo `05_forms`.)*

```
uv run dojo test react i2_interview_drills ex3
```

## Drill 4 — the accessible accordion · ~12 minutes

Edit `ex4/solution.tsx`.

> *"An FAQ accordion. One open at a time. Assume a screen-reader user."*

`Accordion({ sections })` where each section is `{ id, title, body }`:

- each header is a `<button>` with `aria-expanded` (present and `"false"` when
  closed) and `aria-controls` pointing at its panel;
- the open panel has `role="region"` and takes its accessible name from its
  header via `aria-labelledby`;
- opening one closes the other; clicking an open header closes it.

*(Weak here → redo `03_state_events` and `01_components_jsx`.)*

```
uv run dojo test react i2_interview_drills ex4
```

## Drill 5 — the cart editor · ~12 minutes

Edit `ex5/solution.tsx`.

> *"Quantities up and down, remove a line, keep the total right."*

`CartEditor({ initialItems })` over `{ id, name, price, quantity }`:

- one `<li>` per line showing `Apple x2`;
- buttons named `Increase Apple`, `Decrease Apple` and `Remove Apple` — the
  name matters, an unlabelled `+` is a column of identical controls to a screen
  reader;
- decreasing to zero removes the line;
- a live region reads `Total: 5.50`, two decimal places, derived not stored.

*(Weak here → redo `04_lists_conditional` and `09_context_reducer`.)*

```
uv run dojo test react i2_interview_drills ex5
```

## Drill 6 — the confirm dialog · ~15 minutes

Edit `ex6/solution.tsx`.

> *"A delete button that asks first. Try it with the keyboard."*

`DeleteButton({ onConfirm })`. The markup is already correct; the keyboard
behaviour is missing:

- clicking `Delete` opens a `role="dialog"` named `Delete item?`;
- **focus moves to `Cancel`** when it opens;
- `Escape` closes it, and `Cancel` closes it, without confirming;
- `Confirm` calls `onConfirm` once and closes;
- every close **returns focus to the `Delete` button**.

*(Weak here → redo `08_refs_dom` and `06_effects`.)*

```
uv run dojo test react i2_interview_drills ex6
```

## Challenge — the typeahead · ~45 minutes

Edit `challenge/solution.tsx`. This is the real take-home-sized one, and it
combines every drill above.

> *"Build an autocomplete. Debounced. Keyboard-navigable. It should be a proper
> combobox, not a text box with a menu under it."*

`Typeahead({ search, onSelect })`:

- an input labelled `Search products` with `role="combobox"`, `aria-expanded`
  and `aria-controls`;
- suggestions after a **300ms** pause, one request per pause;
- suggestions render as `role="option"` inside a `role="listbox"`;
- `ArrowDown` / `ArrowUp` move a highlighted option — **focus stays in the
  input**, and the input's `aria-activedescendant` holds the highlighted
  option's `id`;
- `Enter` selects the highlighted option: calls `onSelect`, puts the value in
  the box, closes the list. `Escape` closes it;
- a response for a query the user has moved on from is ignored.

Honest difficulty note: this is genuinely a 45-minute task, and the
`aria-activedescendant` pattern is the part most candidates have never
implemented. Enumerate the state before you type anything — hint 1 tells you how
many pieces there are.

```
uv run dojo test react i2_interview_drills challenge
```

## Review — the live filter

`review1/solution.tsx`. `LiveFilter({ fetchMatches })`: an input labelled
`Filter`, a **200ms** debounce, results in a list, and no stale answer allowed
to win. Drill 1 in miniature, resurfaced by the review ladder.

```
uv run dojo test react i2_interview_drills review1
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/i2_interview_drills. Quoted verbatim in README.md.
//
// Timer-driven drills use fireEvent.change rather than user-event: user-event
// waits on real timers, and mixing that with fake ones makes a test that fails
// on a slow machine. Everything else is user-event, as usual.
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { DebouncedSearch } from "./ex1/solution";
import { PagedList } from "./ex2/solution";
import { ProfileForm } from "./ex3/solution";
import { Accordion } from "./ex4/solution";
import { CartEditor } from "./ex5/solution";
import { DeleteButton } from "./ex6/solution";
import { Typeahead } from "./challenge/solution";
import { LiveFilter } from "./review1/solution";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

async function settle(promise: Promise<unknown>, action: () => void) {
  await act(async () => {
    action();
    await promise.catch(() => undefined);
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("i2_interview_drills", () => {
  test("ex1 - DebouncedSearch asks once, after the typing stops", async () => {
    vi.useFakeTimers();
    const search = vi.fn(async (query: string) => [`${query} one`, `${query} two`]);
    render(<DebouncedSearch search={search} />);

    const box = screen.getByLabelText("Search");
    fireEvent.change(box, { target: { value: "r" } });
    fireEvent.change(box, { target: { value: "re" } });
    fireEvent.change(box, { target: { value: "rea" } });

    expect(
      search,
      "three keystrokes and the request has already gone out. Wait until the " +
        "typing pauses - the effect's cleanup cancels the pending timer, which " +
        "is what makes it a debounce (README ex1)",
    ).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(search, "one pause, one request").toHaveBeenCalledTimes(1);
    expect(search, "and it asks for what is in the box now").toHaveBeenLastCalledWith("rea");
    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "the results are listed",
    ).toEqual(["rea one", "rea two"]);

    fireEvent.change(box, { target: { value: "" } });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(
      search,
      "an empty box is not a search - do not send a request for nothing",
    ).toHaveBeenCalledTimes(1);
    expect(screen.queryAllByRole("listitem").length, "and the old results go away").toBe(0);
  });

  test("ex2 - PagedList walks a paged resource and knows where it is", async () => {
    const user = userEvent.setup();
    const pages: Record<number, string[]> = {
      1: ["Ada", "Bo"],
      2: ["Cy", "Dee"],
      3: ["Eli"],
    };
    const fetchPage = vi.fn(async (page: number) => ({ items: pages[page], total: 5 }));

    render(<PagedList fetchPage={fetchPage} pageSize={2} />);

    expect(
      await screen.findByText("Ada"),
      "the first page loads on mount",
    ).toBeInTheDocument();
    expect(
      screen.getByRole("status"),
      "5 items at 2 per page is 3 pages - expect: Page 1 of 3",
    ).toHaveTextContent("Page 1 of 3");
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Cy"), "Next moves forward").toBeInTheDocument();
    expect(screen.queryByText("Ada"), "and replaces the previous page").toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Page 2 of 3");

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Eli"), "and again").toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next" }),
      "the last page is computed from the total the server sent, not guessed",
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
  }, 30000);

  test("ex3 - ProfileForm blocks a bad submit and clears errors as they are fixed", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProfileForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Display name"), "A");
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(onSubmit, "an invalid form must not submit").not.toHaveBeenCalled();
    expect(
      screen.getByLabelText("Display name"),
      "a field that failed validation says so on itself",
    ).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByLabelText("Display name"),
      "and the reason is its accessible description, wired with aria-describedby",
    ).toHaveAccessibleDescription("Display name must be at least 2 characters");
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
      "Enter a valid email address",
    );

    await user.type(screen.getByLabelText("Display name"), "da");
    expect(
      screen.getByLabelText("Display name"),
      "once a submit has been attempted, fixing a field must clear its error " +
        "immediately - making the user press Save again to find out is unkind " +
        "(README ex3)",
    ).toHaveAttribute("aria-invalid", "false");

    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(onSubmit, "and a valid form goes through, once").toHaveBeenCalledWith({
      displayName: "Ada",
      email: "ada@example.com",
    });
  }, 30000);

  test("ex4 - Accordion opens one section at a time and says so out loud", async () => {
    const user = userEvent.setup();
    render(
      <Accordion
        sections={[
          { id: "ship", title: "Shipping", body: "We ship on Tuesdays." },
          { id: "ret", title: "Returns", body: "Thirty days, no questions." },
        ]}
      />,
    );

    const shipping = screen.getByRole("button", { name: "Shipping" });
    expect(
      shipping,
      "an accordion header is a button that reports whether its section is " +
        'open, with aria-expanded - "false" while closed, not absent',
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("We ship on Tuesdays."), "and closed means closed").toBeNull();

    await user.click(shipping);
    expect(shipping, "clicking the header opens it").toHaveAttribute("aria-expanded", "true");

    const panel = screen.queryByRole("region", { name: "Shipping" });
    expect(
      panel,
      "the open panel needs role=region and an accessible name taken from its " +
        "header, so a screen-reader user can jump straight to it",
    ).not.toBeNull();
    expect(panel, "and it holds the body text").toHaveTextContent("We ship on Tuesdays.");

    await user.click(screen.getByRole("button", { name: "Returns" }));
    expect(
      screen.getByRole("button", { name: "Shipping" }),
      "opening one section closes the other - only one may be open at a time",
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("We ship on Tuesdays.")).toBeNull();
    expect(screen.queryByText("Thirty days, no questions.")).not.toBeNull();
  }, 30000);

  test("ex5 - CartEditor keeps quantities, totals and lines in step", async () => {
    const user = userEvent.setup();
    render(
      <CartEditor
        initialItems={[
          { id: "a", name: "Apple", price: 1.5, quantity: 1 },
          { id: "p", name: "Pear", price: 2, quantity: 2 },
        ]}
      />,
    );

    expect(
      screen.getByRole("status"),
      "1 apple at 1.50 plus 2 pears at 2.00 is 5.50 - expect: Total: 5.50",
    ).toHaveTextContent("Total: 5.50");

    await user.click(screen.getByRole("button", { name: "Increase Apple" }));
    expect(
      screen.getByRole("status"),
      "one more apple takes the total to 7.00",
    ).toHaveTextContent("Total: 7.00");
    expect(
      screen.getByText("Apple x2"),
      "each line shows its own quantity, as: Apple x2",
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Decrease Apple" }));
    await user.click(screen.getByRole("button", { name: "Decrease Apple" }));
    expect(
      screen.queryByRole("button", { name: "Increase Apple" }),
      "decreasing to zero removes the line rather than showing a line of none",
    ).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Total: 4.00");

    await user.click(screen.getByRole("button", { name: "Remove Pear" }));
    expect(screen.queryAllByRole("listitem").length, "and Remove empties it").toBe(0);
    expect(screen.getByRole("status"), "an empty cart totals nothing").toHaveTextContent(
      "Total: 0.00",
    );
  }, 30000);

  test("ex6 - DeleteButton opens, closes and gives focus back", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<DeleteButton onConfirm={onConfirm} />);

    const trigger = screen.getByRole("button", { name: "Delete" });
    await user.click(trigger);

    const dialog = screen.queryByRole("dialog");
    expect(dialog, "the dialog appears").not.toBeNull();
    expect(dialog, "named by its own heading, not by an aria-label copy").toHaveAccessibleName(
      "Delete item?",
    );
    expect(
      within(dialog!).getByRole("button", { name: "Cancel" }),
      "focus must move into the dialog when it opens, onto the safe choice",
    ).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog"), "Escape closes it").toBeNull();
    expect(
      screen.getByRole("button", { name: "Delete" }),
      "and focus goes back to the control that opened it - otherwise the user " +
        "is dropped at the top of the document (README ex6)",
    ).toHaveFocus();
    expect(onConfirm, "cancelling deletes nothing").not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm, "confirming calls back exactly once").toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog"), "and closes the dialog").toBeNull();
    expect(screen.getByRole("button", { name: "Delete" }), "focus restored again").toHaveFocus();
  }, 30000);

  test("challenge - Typeahead debounces, then navigates and selects with the keyboard", async () => {
    vi.useFakeTimers();
    const onSelect = vi.fn();
    const search = vi.fn(async () => ["Apple", "Banana", "Cherry"]);
    render(<Typeahead search={search} onSelect={onSelect} />);

    const box = screen.getByRole("combobox", { name: "Search products" });
    expect(box, "the list is closed until there is something to show").toHaveAttribute(
      "aria-expanded",
      "false",
    );

    fireEvent.change(box, { target: { value: "a" } });
    fireEvent.change(box, { target: { value: "an" } });
    expect(search, "still debouncing").not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(search, "one request for the settled query").toHaveBeenCalledTimes(1);
    expect(box, "and the list opens once there are options").toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(
      screen.queryAllByRole("option").map((option) => option.textContent),
      "each suggestion is an option inside a listbox",
    ).toEqual(["Apple", "Banana", "Cherry"]);

    fireEvent.keyDown(box, { key: "ArrowDown" });
    fireEvent.keyDown(box, { key: "ArrowDown" });
    const active = box.getAttribute("aria-activedescendant");
    expect(
      active,
      "arrowing down moves an active option, and the input announces which one " +
        "with aria-activedescendant. Focus itself must stay in the text box - " +
        "that is the whole point of the pattern (README challenge)",
    ).not.toBeNull();
    expect(
      document.getElementById(active ?? ""),
      "the id must belong to the second option",
    ).toHaveTextContent("Banana");

    fireEvent.keyDown(box, { key: "Enter" });
    expect(onSelect, "Enter picks the active option").toHaveBeenCalledWith("Banana");
    expect(box, "and puts it in the box").toHaveValue("Banana");
    expect(screen.queryAllByRole("option").length, "then closes the list").toBe(0);
  });

  test("challenge - Typeahead ignores results for a query the user moved on from", async () => {
    vi.useFakeTimers();
    const slow = deferred<string[]>();
    const quick = deferred<string[]>();
    const search = vi.fn((query: string) => (query === "an" ? slow.promise : quick.promise));
    render(<Typeahead search={search} onSelect={() => {}} />);

    const box = screen.getByRole("combobox", { name: "Search products" });
    fireEvent.change(box, { target: { value: "an" } });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    fireEvent.change(box, { target: { value: "cher" } });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await settle(quick.promise, () => quick.resolve(["Cherry"]));
    expect(
      screen.queryAllByRole("option").map((option) => option.textContent),
      "the current query's suggestions are shown",
    ).toEqual(["Cherry"]);

    await settle(slow.promise, () => slow.resolve(["Banana", "Mango"]));
    expect(
      screen.queryAllByRole("option").map((option) => option.textContent),
      "the abandoned query answered late and took over the list. Debouncing " +
        "reduces how often that happens; only the cleanup guard stops it",
    ).toEqual(["Cherry"]);
  });

  test("review1 - LiveFilter debounces and refuses a stale answer", async () => {
    vi.useFakeTimers();
    const slow = deferred<string[]>();
    const quick = deferred<string[]>();
    const fetchMatches = vi.fn((query: string) => (query === "no" ? slow.promise : quick.promise));
    render(<LiveFilter fetchMatches={fetchMatches} />);

    const box = screen.getByLabelText("Filter");
    fireEvent.change(box, { target: { value: "n" } });
    fireEvent.change(box, { target: { value: "no" } });
    expect(fetchMatches, "one pause, one request").not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(fetchMatches, "and it asks for the settled value").toHaveBeenLastCalledWith("no");

    fireEvent.change(box, { target: { value: "note" } });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    await settle(quick.promise, () => quick.resolve(["Notebook"]));
    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "the current query's matches are listed",
    ).toEqual(["Notebook"]);

    await settle(slow.promise, () => slow.resolve(["Nothing", "Nowhere"]));
    expect(
      screen.queryAllByRole("listitem").map((li) => li.textContent),
      "and a late answer to an old question must not win",
    ).toEqual(["Notebook"]);
  });
});
```

<!-- GATE:END -->

In plain English:

- **ex1** types three characters and asserts *nothing has been requested yet*,
  advances 300ms, and asserts exactly one request for the final value; then
  empties the box and asserts nothing new was requested.
- **ex2** walks all three pages, checking the items, the page indicator and the
  disabled state at each end.
- **ex3** submits a bad form, checks `aria-invalid` and the accessible
  descriptions, fixes one field *without submitting* and checks the error
  cleared, then submits a good one.
- **ex4** checks `aria-expanded` before and after, finds the panel by
  `role="region"` **and its name**, then opens the other section and checks the
  first one closed.
- **ex5** checks the total after each operation and that decreasing to zero
  removes the line.
- **ex6** checks the focus target on open, closes with Escape, checks focus came
  back, then confirms.
- **challenge** is two tests — the debounce plus keyboard flow, and the race —
  and both must pass.
- **review1** races two queries with hand-controlled promises, exactly as
  lesson 07 did.

## The teaching point

Every drill here has a hidden requirement that was not in the prompt: the race
in drill 1, the disabled ends in drill 2, the live error-clearing in drill 3,
the ARIA in drills 4 and 6, the derived total in drill 5. That is not a trick —
it is what "senior" means in a front-end interview. The junior candidate builds
what was asked. The senior candidate builds what was asked and then says "one
thing I'd want to handle before this ships is what happens when two requests
overlap."

So when you finish a drill, do not stop. Ask yourself what you would say next if
somebody were watching, and say it.

Next: **i3_interview_rapidfire**, which brings the ⭐⭐⭐ material back in fresh
form — and keeps bringing it back, on the review ladder, for the next two months.
