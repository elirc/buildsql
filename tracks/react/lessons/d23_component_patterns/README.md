# d23 — Component patterns (drill set)

Eight problems on the shape of the API a component offers, drawing on
`02_props_composition`, `10_custom_hooks` and `11_performance_patterns` at
once. Children and slots, compound components that find each other through a
context, render props, and behaviour extracted into a hook so the markup can be
anybody's.

The gate uses these components the way a colleague would — composing the parts
itself, in its own arrangement — and then checks the accessible DOM that comes
out. That is not decoration here: a tab that does not say it is selected and a
popover whose trigger is not wired to its content are the bugs, not the
styling.

## Exercise 1 — content, not a string

Edit `ex1/solution.tsx`. `Callout({ tone, title, children })` renders a
`role="alert"` element when `tone` is `danger` and `role="status"` otherwise,
containing a level-3 heading with the `title` and then whatever it was given
between its tags — including markup.

```
uv run dojo test react d23_component_patterns ex1
```

## Exercise 2 — the behaviour, extracted

Edit `ex2/solution.tsx`. `useDisclosure(initial?)` returns
`{ open, toggle, close }` and actually holds that state. `FaqItem({ question, answer })`
is built on it: a button reading the question, carrying `aria-expanded`, and
the answer in a paragraph while it is open. Two items on a page keep their own
state.

```
uv run dojo test react d23_component_patterns ex2
```

## Exercise 3 — parts that find each other

Edit `ex3/solution.tsx`. `Tabs({ defaultTab, children })` with `Tabs.List`,
`Tabs.Tab` and `Tabs.Panel` attached to it. The list is a `role="tablist"`
named by its `label`; each tab is a `role="tab"` carrying `aria-selected`;
only the selected panel is rendered, as a `role="tabpanel"`. **No part is ever
given the selected tab as a prop** — the gate does not pass one.

```
uv run dojo test react d23_component_patterns ex3
```

## Exercise 4 — named by what is inside it

Edit `ex4/solution.tsx`. `ProductCard` with `ProductCard.Media`, `ProductCard.Body`, `ProductCard.Title`
and `ProductCard.Actions`. The card is an `<article>`, the title a level-3 heading,
the actions a `<footer>` — and the article's **accessible name** is the title
written inside it. Two cards on one page must not collide.

```
uv run dojo test react d23_component_patterns ex4
```

## Exercise 5 — ids handed to the caller

Edit `ex5/solution.tsx`. `HintedField({ label, hint, children })` where `children` is
a **function** taking `{ id, describedBy }` and returning the control. The
label is bound to that id; the hint, when there is one, is rendered and becomes
the control's accessible description. With no hint, `describedBy` is
`undefined` and the control ends up with no `aria-describedby` at all.

```
uv run dojo test react d23_component_patterns ex5
```

## Exercise 6 — a decision that travels

Edit `ex6/solution.tsx`. `Toolbar({ label, disabled, children })` renders a
`role="toolbar"` with an accessible name; `ToolbarButton({ onClick, disabled, children })`
renders a button. A disabled toolbar disables every button inside it, however
deep, without anybody passing the flag down by hand — and a button may still be
disabled on its own account.

```
uv run dojo test react d23_component_patterns ex6
```

## Exercise 7 — the caller draws the row

Edit `ex7/solution.tsx`. `PickerList({ items, renderItem, empty })` renders one
`<li>` per item, each holding a button whose content is
`renderItem(item, picked)`. Clicking a row picks it — one at a time — and an
empty `items` renders the `empty` slot instead of a list.

```
uv run dojo test react d23_component_patterns ex7
```

## Exercise 8 — a trigger and its content

Edit `ex8/solution.tsx`. `Popover` with `Popover.Trigger` and
`Popover.Content`. The trigger carries `aria-expanded`, and while the popover
is open it carries `aria-controls` pointing at the content's id. The content is
rendered only while open. Opening moves focus to the first focusable element
inside it; `Escape` closes it and returns focus to the trigger.

```
uv run dojo test react d23_component_patterns ex8
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/d23_component_patterns. Quoted verbatim in README.md.
//
// This set is about the shape of an API, so the gate uses these components the
// way a colleague would - composing them itself - and checks the accessible
// DOM that comes out.
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Callout } from "./ex1/solution";
import { useDisclosure, FaqItem } from "./ex2/solution";
import { Tabs } from "./ex3/solution";
import { ProductCard } from "./ex4/solution";
import { HintedField } from "./ex5/solution";
import { Toolbar, ToolbarButton } from "./ex6/solution";
import { PickerList } from "./ex7/solution";
import { Popover } from "./ex8/solution";

const texts = (role: string) => screen.queryAllByRole(role).map((node) => node.textContent);

describe("d23_component_patterns", () => {
  test("ex1 - Callout holds whatever it is given", () => {
    render(
      <Callout tone="danger" title="Deploy failed">
        The build could not start. <button type="button">Retry</button>
      </Callout>,
    );

    const alert = screen.getByRole("alert");
    expect(
      alert,
      "a component that takes its content as a string can only ever hold a " +
        "string. Between the tags is where anything at all can go, which is why " +
        "children exists (README ex1)",
    ).toHaveTextContent("The build could not start.");
    expect(
      screen.queryByRole("button", { name: "Retry" }),
      "including a whole button, which no text prop could have carried",
    ).not.toBeNull();
    expect(
      screen.queryByRole("heading", { name: "Deploy failed" }),
      "and the title is still a slot of its own",
    ).not.toBeNull();

    render(
      <Callout tone="info" title="All clear">
        Nothing to do.
      </Callout>,
    );
    expect(screen.queryByRole("status"), "a calmer tone is a calmer role").toHaveTextContent(
      "Nothing to do.",
    );
  }, 30000);

  test("ex2 - useDisclosure is the behaviour, FaqItem is the markup", () => {
    const { result } = renderHook(() => useDisclosure());

    expect(result.current.open, "it starts closed").toBe(false);
    act(() => result.current.toggle());
    expect(
      result.current.open,
      "the hook has to actually hold the state - extracting behaviour means " +
        "moving it, not describing it (README ex2)",
    ).toBe(true);
    act(() => result.current.close());
    expect(result.current.open, "and close closes").toBe(false);

    render(
      <>
        <FaqItem question="Do you ship abroad?" answer="Yes, everywhere." />
        <FaqItem question="Can I pay later?" answer="No, sorry." />
      </>,
    );

    const first = screen.getByRole("button", { name: "Do you ship abroad?" });
    expect(first, "a closed question says so to a screen reader").toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByText("Yes, everywhere."), "and its answer is not there").toBeNull();

    fireEvent.click(first);
    expect(first, "opening flips the attribute").toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByText("Yes, everywhere."), "and shows the answer").not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Can I pay later?" }),
      "two items calling the same hook keep their own state - a hook is a " +
        "recipe, not a place",
    ).toHaveAttribute("aria-expanded", "false");
  }, 30000);

  test("ex3 - Tabs shares its state with the parts that need it", () => {
    render(
      <Tabs defaultTab="beans">
        <Tabs.List label="Products">
          <Tabs.Tab id="beans">Beans</Tabs.Tab>
          <Tabs.Tab id="mugs">Mugs</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="beans">Whole bean coffee</Tabs.Panel>
        <Tabs.Panel id="mugs">Ceramic mugs</Tabs.Panel>
      </Tabs>,
    );

    expect(
      screen.queryByRole("tablist", { name: "Products" }),
      "a set of tabs is a tablist, and it needs a name of its own",
    ).not.toBeNull();
    expect(
      screen.queryByRole("tab", { name: "Beans", selected: true }),
      "the tab that is showing says it is selected. The caller never passed a " +
        "selected prop to anything - the parts find that out from the component " +
        "they are written inside (README ex3)",
    ).not.toBeNull();
    expect(screen.queryByRole("tab", { name: "Mugs", selected: false })).not.toBeNull();
    expect(
      screen.queryAllByRole("tabpanel").length,
      "and only the panel that is showing is on screen",
    ).toBe(1);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Whole bean coffee");

    fireEvent.click(screen.getByRole("tab", { name: "Mugs" }));
    expect(screen.queryByRole("tab", { name: "Mugs", selected: true }), "clicking picks").not.toBeNull();
    expect(screen.getByRole("tabpanel"), "and the panel follows").toHaveTextContent("Ceramic mugs");
  }, 30000);

  test("ex4 - ProductCard is named by the title written inside it", () => {
    render(
      <>
        <ProductCard>
          <ProductCard.Media>
            <img alt="A bag of beans" src="beans.png" />
          </ProductCard.Media>
          <ProductCard.Body>
            <ProductCard.Title>House blend</ProductCard.Title>
            <p>Sweet and nutty</p>
          </ProductCard.Body>
          <ProductCard.Actions>
            <button type="button">Buy House blend</button>
          </ProductCard.Actions>
        </ProductCard>
        <ProductCard>
          <ProductCard.Body>
            <ProductCard.Title>Decaf</ProductCard.Title>
          </ProductCard.Body>
        </ProductCard>
      </>,
    );

    expect(
      screen.queryByRole("article", { name: "House blend" }),
      "the card takes its accessible name from the title somebody wrote inside " +
        "it, which means an id has to travel from the card down to the title " +
        "and a reference back up. useId is what keeps two cards on one page " +
        "from colliding (README ex4)",
    ).not.toBeNull();
    expect(
      screen.queryByRole("article", { name: "Decaf" }),
      "and the second card is named by its own title, not the first one-s",
    ).not.toBeNull();
    expect(
      screen.queryByRole("heading", { name: "House blend" }),
      "the title is still a heading",
    ).not.toBeNull();
    expect(screen.queryByRole("img", { name: "A bag of beans" }), "the media is there").not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "Buy House blend" }),
      "and so are the actions",
    ).not.toBeNull();
  }, 30000);

  test("ex5 - HintedField hands the control the ids it needs", () => {
    render(
      <>
        <HintedField label="Password" hint="At least 12 characters">
          {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} type="password" />}
        </HintedField>
        <HintedField label="Nickname">
          {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} />}
        </HintedField>
      </>,
    );

    const password = screen.getByLabelText("Password");
    expect(
      password,
      "two fields on one page, and each label points at its own control. A " +
        "hard-coded id makes the second field steal the first one-s label " +
        "(README ex5)",
    ).toBeInTheDocument();
    expect(password, "and the hint is the control-s description").toHaveAccessibleDescription(
      "At least 12 characters",
    );

    const nickname = screen.getByLabelText("Nickname");
    expect(nickname, "the second field is labelled too").toBeInTheDocument();
    expect(
      nickname,
      "with no hint there is nothing to describe it, and a describedby " +
        "pointing at an element that does not exist is worse than none at all",
    ).not.toHaveAttribute("aria-describedby");
  }, 30000);

  test("ex6 - Toolbar disables everything inside it", () => {
    const onBold = vi.fn();
    const { unmount } = render(
      <Toolbar label="Formatting" disabled>
        <ToolbarButton onClick={onBold}>Bold</ToolbarButton>
        <ToolbarButton onClick={() => undefined}>Italic</ToolbarButton>
      </Toolbar>,
    );

    expect(screen.queryByRole("toolbar", { name: "Formatting" }), "it is a toolbar").not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Bold" }),
      "a disabled toolbar disables what is in it, however deep - passing the " +
        "flag down by hand means every future button has to remember to take it " +
        "(README ex6)",
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Italic" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(onBold, "and a disabled button does nothing").not.toHaveBeenCalled();

    unmount();

    render(
      <Toolbar label="Formatting">
        <ToolbarButton onClick={onBold}>Bold</ToolbarButton>
        <ToolbarButton onClick={() => undefined} disabled>
          Italic
        </ToolbarButton>
      </Toolbar>,
    );

    expect(screen.getByRole("button", { name: "Bold" }), "an enabled toolbar enables").toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Italic" }),
      "and a button may still say no for itself",
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(onBold, "the enabled one works").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex7 - PickerList lets the caller decide what a row looks like", () => {
    const { unmount } = render(
      <PickerList
        items={["Beans", "Mugs", "Filters"]}
        renderItem={(item, picked) => (
          <span>
            {item}
            {picked ? " (picked)" : ""}
          </span>
        )}
        empty={<p>Nothing to choose from</p>}
      />,
    );

    expect(texts("listitem"), "the caller-s markup is what shows").toEqual([
      "Beans",
      "Mugs",
      "Filters",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Mugs" }));
    expect(
      screen.queryByRole("button", { name: "Mugs (picked)" }),
      "the list owns which row is picked and the caller owns how that looks - " +
        "which is only possible if the list passes it down when it asks for the " +
        "markup (README ex7)",
    ).not.toBeNull();
    expect(texts("listitem"), "and only that row is picked").toEqual([
      "Beans",
      "Mugs (picked)",
      "Filters",
    ]);

    unmount();

    render(
      <PickerList
        items={[]}
        renderItem={(item: string) => <span>{item}</span>}
        empty={<p>Nothing to choose from</p>}
      />,
    );
    expect(
      screen.queryByText("Nothing to choose from"),
      "an empty list is not an empty <ul> - the caller gave you something to " +
        "say and it has to be said",
    ).not.toBeNull();
    expect(screen.queryAllByRole("listitem").length, "with no rows at all").toBe(0);
  }, 30000);

  test("ex8 - Popover wires its trigger to its content", () => {
    render(
      <Popover>
        <Popover.Trigger>Options</Popover.Trigger>
        <Popover.Content>
          <button type="button">Rename</button>
          <button type="button">Delete</button>
        </Popover.Content>
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: "Options" });
    expect(trigger, "a closed popover says so").toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Rename" }), "and shows nothing").toBeNull();

    fireEvent.click(trigger);

    expect(trigger, "opening flips it").toHaveAttribute("aria-expanded", "true");
    const controls = trigger.getAttribute("aria-controls");
    expect(
      controls,
      "and the trigger has to say which element it controls, by id - the two " +
        "halves are written in different components, so that id can only come " +
        "from the one component that contains them both (README ex8)",
    ).toBeTruthy();
    expect(
      document.getElementById(controls ?? ""),
      "and something with that id has to exist, or the reference is a dead link",
    ).not.toBeNull();

    expect(
      screen.getByRole("button", { name: "Rename" }),
      "opening moves the keyboard into the popover, or it is a menu nobody can " +
        "reach without a mouse",
    ).toHaveFocus();

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });

    expect(trigger, "Escape closes it").toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Rename" }), "the content is gone").toBeNull();
    expect(
      trigger,
      "and focus comes back to the trigger, because the element that had it has " +
        "just been removed from the document",
    ).toHaveFocus();
  }, 30000);
});
```

<!-- GATE:END -->

Next: **d24_mixed_gauntlet**, the last set, where every problem is two or three
of these ideas at once.
