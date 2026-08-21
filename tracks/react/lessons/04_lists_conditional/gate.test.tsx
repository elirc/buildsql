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
