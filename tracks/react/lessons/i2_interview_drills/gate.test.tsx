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
