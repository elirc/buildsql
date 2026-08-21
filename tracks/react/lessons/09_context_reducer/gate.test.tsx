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
