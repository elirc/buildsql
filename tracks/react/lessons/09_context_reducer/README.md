# 09 — Context and reducers

Two problems show up at the same moment in a growing application, and this
lesson is one answer to each.

The first is **prop drilling**. The theme is chosen at the top of the app and
needed by a button nine levels down, so nine components take a `theme` prop
they do not use, pass it on, and now cannot be moved or reused without dragging
it along. Context fixes that: a value published at one level of the tree and
read at any depth below, skipping everything in between.

The second is that **`useState` stops scaling** once a single interaction has to
change several related things at once. Adding an item to a cart touches the
line, the quantity, maybe the total; adding a task assigns an id and appends;
and the logic ends up smeared across four event handlers that each have to
remember the same rules. `useReducer` gathers all of it into one pure function
that takes the current state and a description of what happened, and returns the
next state.

They are independent tools and they combine beautifully — a reducer holds the
state, a context publishes it and the `dispatch` to everyone who needs them,
which is the challenge at the end of this lesson and roughly how every state
management library works underneath.

A warning before you enjoy it too much. Context is not a state manager and it is
not free: every component that reads a context re-renders when that context's
value changes, and a value that is a fresh object each render changes every
time. Reach for context for things that are genuinely tree-wide and change
rarely — theme, locale, the current user, a dispatch function. Reach for it as
"a global variable that React knows about" and you will build something slow.

## Concept — publish a value, and describe what happened

**Context, in three pieces:**

```tsx
// 1. the channel, created once at module scope
const ThemeContext = createContext<string | null>(null);

// 2. the publisher
function ThemeProvider({ theme, children }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

// 3. the subscriber, at any depth
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button type="button">Theme: {theme}</button>;
}
```

`useContext` walks up the tree and takes the value from the nearest matching
provider. If there is none, it returns the default you passed to
`createContext` — and that default is a trap worth designing around. A
plausible-looking default (`"light"`) means a component rendered outside its
provider works *incorrectly and silently*. A default of `null`, plus a custom
hook that throws, turns a wiring mistake into an error message with the
provider's name in it:

```tsx
export function useTheme() {
  const value = useContext(ThemeContext);
  if (value === null) throw new Error("useTheme must be used inside a ThemeProvider");
  return value;
}
```

That hook is also the right place to hide the context object entirely, so
consumers import `useTheme` and never `ThemeContext`.

**A reducer** is a pure function — no React, no side effects, testable by
calling it:

```tsx
function reducer(state, action) {
  switch (action.type) {
    case "added":   return [...state, action.item];
    case "removed": return state.filter((x) => x.id !== action.id);
    default:        return state;
  }
}
```

Same inputs, same output, and it never modifies the state it was handed — it
returns a new one, because React decides whether anything changed by comparing
references.

`useReducer` connects it to a component:

```tsx
const [state, dispatch] = useReducer(reducer, initialState);
…
<button onClick={() => dispatch({ type: "removed", id })}>Remove</button>
```

Handlers stop computing new state and start *describing events*. Name actions
after what happened (`added`, `toggled`, `quantitySet`) rather than after what
you want done (`setItems`) — it keeps the reducer the only place that knows the
rules.

Two practical notes. `dispatch` is **guaranteed stable** across renders, so it
never needs to be in a dependency array — a real advantage over passing setter
functions around. And a reducer must tolerate being called twice with the same
arguments, which is why purity is not optional.

## Exercise 1 — context

Edit `ex1/solution.tsx`. Export `ThemeProvider({ theme, children })` and
`ThemedButton()`. The button renders `Theme: dark` when the provider above it
was given `theme="dark"`, and gets **no props** — the gate renders it three
levels deep inside a wrapper it defines itself.

```
uv run dojo test react 09_context_reducer ex1
```

## Exercise 2 — a context that fails loudly

Edit `ex2/solution.tsx`. It already exports `SettingsProvider`, `useSettings`
and `Density`. As written, rendering `Density` with no provider quietly shows
the default. Change it so that `useSettings()` **throws** an error whose message
contains `SettingsProvider`, while still working normally inside one.

```
uv run dojo test react 09_context_reducer ex2
```

## Exercise 3 — a reducer, on its own

Edit `ex3/solution.tsx`. Implement `cartReducer(state, action)` over an array of
`{ id, name, price, quantity }`:

- `{ type: "added", id, name, price }` — if that id is already in the cart,
  increase its `quantity` by one; otherwise append a new line with
  `quantity: 1`.
- `{ type: "removed", id }` — drop that line.
- `{ type: "quantitySet", id, quantity }` — set the quantity; if it is `0` or
  less, the line is removed instead.
- `{ type: "cleared" }` — an empty cart.

No component and no hooks: the gate calls this function directly, and it also
checks that the state you were handed comes back unmodified.

```
uv run dojo test react 09_context_reducer ex3
```

## Exercise 4 — `useReducer` in a component

Edit `ex4/solution.tsx`. `tasksReducer` and `initialTasks` are **already
written**; the work is the component. `TaskList` renders:

- a controlled input labelled `New task` and a button reading `Add`, which adds
  the task and clears the box;
- a `<ul>` with one `<li>` per task, each containing a checkbox whose label is
  the task's text, checked when the task is done, and toggling that one task;
- a live region reading `1 of 2 done`.

```
uv run dojo test react 09_context_reducer ex4
```

## Challenge — both at once

Edit `challenge/solution.tsx`. `paletteReducer` is written for you. Build:

- `PaletteProvider({ children })` — holds the palette in a `useReducer`
  starting at `"day"` and publishes both the value and the `dispatch`;
- `PaletteLabel()` — a live region reading `Palette: day`;
- `PaletteToggle()` — a button reading `Toggle palette` that flips it.

The gate puts the toggle inside a `<header>` and the label inside a
`<main><section>`, so they are in different branches of the tree and **neither
takes props**.

Honest difficulty note: the design decision is what to put in the context
value. If you get it working, read hint 3 anyway — there is a performance bug
that passes the gate.

```
uv run dojo test react 09_context_reducer challenge
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/09_context_reducer. Quoted verbatim in README.md.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { ThemeProvider, ThemedButton } from "./ex1/solution";
import { Density, SettingsProvider } from "./ex2/solution";
import { cartReducer } from "./ex3/solution";
import { TaskList } from "./ex4/solution";
import { PaletteProvider, PaletteLabel, PaletteToggle } from "./challenge/solution";

describe("09_context_reducer", () => {
  test("ex1 - ThemedButton reads the theme without being passed it", () => {
    function Deep() {
      return (
        <div>
          <section>
            <ThemedButton />
          </section>
        </div>
      );
    }

    const { rerender } = render(
      <ThemeProvider theme="dark">
        <Deep />
      </ThemeProvider>,
    );

    expect(
      screen.queryByRole("button"),
      "the button is three levels below the provider and gets no props at all, " +
        "so the value has to arrive through context - expect: Theme: dark",
    ).toHaveTextContent("Theme: dark");

    rerender(
      <ThemeProvider theme="light">
        <Deep />
      </ThemeProvider>,
    );
    expect(
      screen.queryByRole("button"),
      "changing the provider's value must re-render every consumer below it",
    ).toHaveTextContent("Theme: light");
  });

  test("ex2 - useSettings refuses to work outside its provider", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(
      () => render(<Density />),
      "rendered with no provider above it, the hook silently handed back a " +
        "default. That turns a wiring mistake into a component that looks fine " +
        "and shows the wrong data - throw a named error instead (README ex2)",
    ).toThrow(/SettingsProvider/);

    errors.mockClear();
    render(
      <SettingsProvider density="compact">
        <Density />
      </SettingsProvider>,
    );
    expect(
      screen.queryByRole("status"),
      "inside the provider it must work normally - expect: Density: compact",
    ).toHaveTextContent("Density: compact");
  });

  test("ex3 - cartReducer is a pure function of state and action", () => {
    const empty = cartReducer([], { type: "added", id: "a", name: "Apple", price: 2 });
    expect(
      empty,
      "adding to an empty cart puts one line in it with quantity 1",
    ).toEqual([{ id: "a", name: "Apple", price: 2, quantity: 1 }]);

    const again = cartReducer(empty, { type: "added", id: "a", name: "Apple", price: 2 });
    expect(
      again,
      "adding something already in the cart raises its quantity rather than " +
        "adding a second line",
    ).toEqual([{ id: "a", name: "Apple", price: 2, quantity: 2 }]);
    expect(
      empty,
      "a reducer may never modify the state it was given - it returns a new " +
        "one. React compares by reference, so an in-place edit renders nothing",
    ).toEqual([{ id: "a", name: "Apple", price: 2, quantity: 1 }]);

    const two = cartReducer(again, { type: "added", id: "p", name: "Pear", price: 3 });
    expect(
      cartReducer(two, { type: "quantitySet", id: "a", quantity: 5 }).find((i) => i.id === "a"),
      "quantitySet replaces the quantity outright",
    ).toEqual({ id: "a", name: "Apple", price: 2, quantity: 5 });
    expect(
      cartReducer(two, { type: "quantitySet", id: "a", quantity: 0 }).map((i) => i.id),
      "a quantity of zero or less means the line is gone, not a line showing 0",
    ).toEqual(["p"]);
    expect(
      cartReducer(two, { type: "removed", id: "p" }).map((i) => i.id),
      "removed drops exactly one line",
    ).toEqual(["a"]);
    expect(cartReducer(two, { type: "cleared" }), "cleared empties the cart").toEqual([]);
  });

  test("ex4 - TaskList drives its whole UI from one reducer", async () => {
    const user = userEvent.setup();
    render(<TaskList />);

    await user.type(screen.getByLabelText("New task"), "Write the gate");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.type(screen.getByLabelText("New task"), "Ship it");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(
      screen.queryAllByRole("listitem").length,
      "two adds, two tasks - and the box has to clear itself between them, or " +
        "the second task is called Write the gateShip it",
    ).toBe(2);
    expect(screen.getByRole("status"), "nothing is done yet").toHaveTextContent("0 of 2 done");

    await user.click(screen.getByLabelText("Write the gate"));
    expect(
      screen.getByLabelText("Write the gate"),
      "ticking a task's checkbox marks that task done",
    ).toBeChecked();
    expect(
      screen.getByLabelText("Ship it"),
      "and only that one - the action carries an id, so give each task its own",
    ).not.toBeChecked();
    expect(
      screen.getByRole("status"),
      "the summary is derived from the task list during render, not stored",
    ).toHaveTextContent("1 of 2 done");
  }, 30000);

  test("challenge - PaletteToggle changes what PaletteLabel shows, with no props", async () => {
    const user = userEvent.setup();

    function App() {
      return (
        <PaletteProvider>
          <header>
            <PaletteToggle />
          </header>
          <main>
            <section>
              <PaletteLabel />
            </section>
          </main>
        </PaletteProvider>
      );
    }

    render(<App />);

    expect(screen.getByRole("status"), "the palette starts on day").toHaveTextContent(
      "Palette: day",
    );

    await user.click(screen.getByRole("button", { name: "Toggle palette" }));
    expect(
      screen.getByRole("status"),
      "the toggle and the label are in different branches of the tree and " +
        "neither takes props. The state and the way to change it both have to " +
        "come down through the provider (README challenge)",
    ).toHaveTextContent("Palette: night");

    await user.click(screen.getByRole("button", { name: "Toggle palette" }));
    expect(screen.getByRole("status"), "and back again").toHaveTextContent("Palette: day");
  }, 20000);
});
```

<!-- GATE:END -->

In plain English:

- **ex1** defines a `Deep` wrapper inside the test so the button is genuinely
  far from the provider, then re-renders the provider with a new theme to check
  consumers follow.
- **ex2** wraps `render` in `expect(...).toThrow(/SettingsProvider/)`, which
  needs the error message to name the provider. `console.error` is silenced
  because React logs any render error before rethrowing it.
- **ex3** calls your reducer directly — no rendering at all — and then re-checks
  the *first* result to prove nothing was mutated along the way.
- **ex4** types and clicks its way to two tasks, finds each checkbox **by its
  label**, and checks the derived summary.
- **challenge** builds a small app with the toggle and the label in separate
  branches, clicks the toggle, and asserts the label changed.

## The teaching point

The rule for context is: **pass what changes rarely and is needed widely.**
Theme, locale, the signed-in user, a dispatch function. Everything a component
reads from context is a re-render it takes when that context changes, and
everything you put in context is a dependency that does not show up in the JSX,
so it is invisible when you read the tree. Composition — passing JSX down as
children — deletes a surprising number of prop-drilling problems before you get
to context at all.

The rule for reducers is: **reach for one when the transitions have rules.**
Not when there are several fields; when the rules for changing them live in
more than one place. Once the reducer exists it is a pure function you can test
by calling, an audit log of every way your state can change, and — because
`dispatch` is stable — the easiest thing in React to pass across a large tree.

Next: **10_custom_hooks**, where you start extracting all of this into
functions of your own.
