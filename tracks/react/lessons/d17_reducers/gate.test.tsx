// Gate for react/d17_reducers. Quoted verbatim in README.md.
//
// Half of this file calls reducers as what they are - plain functions - and
// checks the state it handed in came back untouched. The other half drives
// them through a component.
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { wizardReducer, type WizardState } from "./ex1/solution";
import { seatingReducer, type SeatingState } from "./ex2/solution";
import { PollPanel } from "./ex3/solution";
import { BudgetPlanner } from "./ex4/solution";
import { moderationReducer, type ModerationAction, type ModerationState } from "./ex5/solution";
import { jobReducer, type JobState } from "./ex6/solution";
import { withHistory, type History } from "./ex7/solution";
import { MonitorPanel } from "./ex8/solution";

const texts = (role: string) => screen.queryAllByRole(role).map((node) => node.textContent);

describe("d17_reducers", () => {
  test("ex1 - wizardReducer moves between steps and stops at the ends", () => {
    const start: WizardState = { step: 0, total: 3 };

    const second = wizardReducer(start, { type: "next" });
    expect(second, "next moves one step on").toEqual({ step: 1, total: 3 });
    expect(
      start,
      "and the state it was handed comes back untouched. A reducer that edits " +
        "its argument is not a reducer - React compares the old state with the " +
        "new one by reference, and two references to one mutated object are " +
        "equal (README ex1)",
    ).toEqual({ step: 0, total: 3 });
    expect(second, "so the answer has to be a different object").not.toBe(start);

    const third = wizardReducer(second, { type: "next" });
    expect(third, "and on again").toEqual({ step: 2, total: 3 });

    expect(
      wizardReducer(third, { type: "next" }),
      "there is no fourth step of three, so there is nothing to do - and " +
        "returning the very state you were given is how a reducer says so. " +
        "React skips the re-render when the answer is the object it already has",
    ).toBe(third);
    expect(wizardReducer(start, { type: "back" }), "the same before the first step").toBe(start);

    expect(wizardReducer(third, { type: "back" }), "back really does go back").toEqual({
      step: 1,
      total: 3,
    });
    expect(wizardReducer(third, { type: "reset" }), "reset returns to the start").toEqual({
      step: 0,
      total: 3,
    });
    expect(
      wizardReducer(start, { type: "reset" }),
      "and resetting a wizard that is already at the start changes nothing",
    ).toBe(start);
  }, 30000);

  test("ex2 - seatingReducer adds, removes and refuses", () => {
    const empty: SeatingState = { chosen: [], capacity: 2 };

    const one = seatingReducer(empty, { type: "toggled", seat: "A1" });
    expect(one.chosen, "a free seat is taken").toEqual(["A1"]);
    expect(
      empty.chosen,
      "and the array you were handed is not yours to push onto - copy it " +
        "(README ex2)",
    ).toEqual([]);

    const two = seatingReducer(one, { type: "toggled", seat: "B2" });
    expect(two.chosen, "seats stay in the order they were chosen").toEqual(["A1", "B2"]);

    expect(
      seatingReducer(two, { type: "toggled", seat: "C3" }),
      "the booking holds two seats and that is the capacity, so a third is " +
        "refused - and a refused action returns the state unchanged rather " +
        "than a copy of it",
    ).toBe(two);

    expect(
      seatingReducer(two, { type: "toggled", seat: "A1" }).chosen,
      "toggling a seat that is already chosen gives it up, even at capacity",
    ).toEqual(["B2"]);

    expect(seatingReducer(two, { type: "cleared" }).chosen, "cleared means none").toEqual([]);
    expect(
      seatingReducer(empty, { type: "cleared" }),
      "and clearing an empty booking is nothing at all",
    ).toBe(empty);
  }, 30000);

  test("ex3 - PollPanel counts votes and works out the total itself", async () => {
    const user = userEvent.setup();
    render(<PollPanel options={["Espresso", "Filter", "Cold brew"]} />);

    expect(texts("listitem"), "every option starts at nothing").toEqual([
      "Espresso: 0",
      "Filter: 0",
      "Cold brew: 0",
    ]);
    expect(screen.getByRole("status")).toHaveTextContent("0 votes");

    await user.click(screen.getByRole("button", { name: "Vote for Filter" }));
    expect(texts("listitem"), "a vote lands on the option it was cast for").toEqual([
      "Espresso: 0",
      "Filter: 1",
      "Cold brew: 0",
    ]);
    expect(
      screen.getByRole("status"),
      "and the total follows immediately. A total kept in the state alongside " +
        "the counts is a second copy of the same fact, and every action has to " +
        "remember to update it - miss one and the two disagree for ever. Add " +
        "the counts up while rendering instead (README ex3)",
    ).toHaveTextContent("1 vote");

    await user.click(screen.getByRole("button", { name: "Vote for Filter" }));
    await user.click(screen.getByRole("button", { name: "Vote for Espresso" }));
    expect(texts("listitem")).toEqual(["Espresso: 1", "Filter: 2", "Cold brew: 0"]);
    expect(screen.getByRole("status"), "three votes now").toHaveTextContent("3 votes");

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(texts("listitem"), "and reset puts every option back").toEqual([
      "Espresso: 0",
      "Filter: 0",
      "Cold brew: 0",
    ]);
    expect(screen.getByRole("status")).toHaveTextContent("0 votes");
  }, 30000);

  test("ex4 - BudgetPlanner works its opening balance out once", async () => {
    const user = userEvent.setup();
    const parsePlan = vi.fn((plan: string) => ({
      remaining: plan.split(",").reduce((sum, part) => sum + Number(part), 0),
    }));

    const { rerender } = render(
      <BudgetPlanner plan="120,80,50" label="Q1" parsePlan={parsePlan} />,
    );
    expect(screen.getByRole("status"), "the plan adds up to 250").toHaveTextContent(
      "Remaining: 250",
    );
    expect(parsePlan, "and it has been read once").toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Spend 10" }));
    await user.click(screen.getByRole("button", { name: "Spend 10" }));
    await user.click(screen.getByRole("button", { name: "Spend 10" }));
    expect(screen.getByRole("status"), "spending comes off the balance").toHaveTextContent(
      "Remaining: 220",
    );
    expect(
      parsePlan,
      "useReducer(reducer, parsePlan(plan)) calls parsePlan on every single " +
        "render and throws every result but the first away - the argument is " +
        "evaluated before useReducer runs. The third parameter exists precisely " +
        "so the work happens once (README ex4)",
    ).toHaveBeenCalledTimes(1);

    rerender(<BudgetPlanner plan="120,80,50" label="Q2" parsePlan={parsePlan} />);
    expect(screen.queryByText("Q2"), "a new label renders").not.toBeNull();
    expect(screen.getByRole("status"), "and the balance is where it was").toHaveTextContent(
      "Remaining: 220",
    );
    expect(parsePlan, "still once").toHaveBeenCalledTimes(1);
  }, 30000);

  test("ex5 - moderationReducer edits nobody and shouts at nonsense", () => {
    const start: ModerationState = {
      tickets: [
        { id: "t1", status: "open" },
        { id: "t2", status: "open" },
      ],
    };

    const approved = moderationReducer(start, { type: "approved", id: "t1" });
    expect(
      approved.tickets.map((ticket) => ticket.status),
      "the named ticket takes the decision",
    ).toEqual(["approved", "open"]);
    expect(
      start.tickets[0].status,
      "and the ticket you were handed is still open, because a reducer copies " +
        "rather than edits - the objects inside the state are as untouchable " +
        "as the state itself (README ex5)",
    ).toBe("open");
    expect(
      approved.tickets[1],
      "the rows that were not decided are the same objects, not copies of them " +
        "- rebuilding every row is how a memoized list ends up re-rendering all " +
        "of it",
    ).toBe(start.tickets[1]);

    const escalated = moderationReducer(approved, { type: "escalated", id: "t2" });
    expect(escalated.tickets.map((ticket) => ticket.status)).toEqual(["approved", "escalated"]);
    expect(
      moderationReducer(escalated, { type: "rejected", id: "t9" }),
      "an id that is not in the queue decides nothing",
    ).toBe(escalated);

    expect(
      () => moderationReducer(start, { type: "deleted", id: "t1" } as unknown as ModerationAction),
      "an action nobody wrote a case for is a bug in the caller, and a silent " +
        "default branch hides it until somebody notices the button does " +
        "nothing. Throw, and name the type you were given",
    ).toThrow(/deleted/);
  }, 30000);

  test("ex6 - jobReducer only allows the transitions that make sense", () => {
    const idle: JobState = { status: "idle", progress: 0 };

    expect(
      jobReducer(idle, { type: "paused" }),
      "a job that has not started cannot be paused, and the answer to an " +
        "impossible transition is the state you were given (README ex6)",
    ).toBe(idle);
    expect(jobReducer(idle, { type: "progressed", by: 10 }), "nor can it progress").toBe(idle);
    expect(jobReducer(idle, { type: "finished" }), "nor finish").toBe(idle);

    const running = jobReducer(idle, { type: "started" });
    expect(running, "starting is the one thing an idle job can do").toEqual({
      status: "running",
      progress: 0,
    });
    expect(jobReducer(running, { type: "started" }), "and starting a running job is nothing").toBe(
      running,
    );

    const part = jobReducer(jobReducer(running, { type: "progressed", by: 30 }), {
      type: "progressed",
      by: 50,
    });
    expect(part, "progress adds up while it runs").toEqual({ status: "running", progress: 80 });
    expect(
      jobReducer(part, { type: "progressed", by: 40 }),
      "and stops at a hundred rather than going past it",
    ).toEqual({ status: "running", progress: 100 });

    const paused = jobReducer(part, { type: "paused" });
    expect(paused, "a running job can be paused").toEqual({ status: "paused", progress: 80 });
    expect(
      jobReducer(paused, { type: "progressed", by: 10 }),
      "a paused job makes no progress",
    ).toBe(paused);
    expect(jobReducer(paused, { type: "finished" }), "and cannot finish from there").toBe(paused);

    const resumed = jobReducer(paused, { type: "resumed" });
    expect(resumed, "resuming keeps the progress it had").toEqual({
      status: "running",
      progress: 80,
    });
    expect(jobReducer(resumed, { type: "finished" }), "finishing means finished").toEqual({
      status: "done",
      progress: 100,
    });

    expect(jobReducer(paused, { type: "reset" }), "reset works from anywhere").toEqual(idle);
    expect(jobReducer(idle, { type: "reset" }), "and resets nothing when it is already idle").toBe(
      idle,
    );
  }, 30000);

  test("ex7 - withHistory adds undo and redo to somebody else s reducer", () => {
    type Shape = { count: number };
    type ShapeAction = { type: "added"; by: number } | { type: "cleared" };

    function base(state: Shape, action: ShapeAction): Shape {
      if (action.type === "added") return { count: state.count + action.by };
      return state.count === 0 ? state : { count: 0 };
    }

    const reducer = withHistory(base);
    const first: History<Shape> = { past: [], present: { count: 0 }, future: [] };

    const two = reducer(first, { type: "added", by: 2 });
    expect(two.present, "the wrapped reducer still does the real work").toEqual({ count: 2 });
    expect(two.past, "and what it replaced is remembered").toEqual([{ count: 0 }]);

    const five = reducer(two, { type: "added", by: 3 });
    expect(five.present).toEqual({ count: 5 });
    expect(five.past, "the past grows at the end").toEqual([{ count: 0 }, { count: 2 }]);

    const zero = reducer(five, { type: "cleared" });
    expect(zero.present).toEqual({ count: 0 });
    expect(
      reducer(zero, { type: "cleared" }),
      "clearing a cleared shape changed nothing, and something that changed " +
        "nothing is not a step the user can undo. The wrapper has to compare " +
        "what came back with what went in (README ex7)",
    ).toBe(zero);

    const undone = reducer(zero, { type: "undo" });
    expect(undone.present, "undo goes back one step").toEqual({ count: 5 });
    expect(undone.future, "and what was undone is waiting to be redone").toEqual([{ count: 0 }]);
    expect(undone.past, "with the past one shorter").toEqual([{ count: 0 }, { count: 2 }]);

    const redone = reducer(undone, { type: "redo" });
    expect(redone.present, "redo goes forward again").toEqual({ count: 0 });
    expect(redone.future, "with nothing left to redo").toEqual([]);

    const branched = reducer(reducer(redone, { type: "undo" }), { type: "added", by: 1 });
    expect(branched.present, "and a new action after an undo does the new thing").toEqual({
      count: 6,
    });
    expect(
      branched.future,
      "which throws the redo branch away - there is no going forward to a " +
        "future that is no longer the one you are in",
    ).toEqual([]);

    const fresh: History<Shape> = { past: [], present: { count: 7 }, future: [] };
    expect(reducer(fresh, { type: "undo" }), "nothing to undo, nothing happens").toBe(fresh);
    expect(reducer(fresh, { type: "redo" }), "nothing to redo either").toBe(fresh);
  }, 30000);

  test("ex8 - MonitorPanel keeps one subscription and never loses an alert", async () => {
    const user = userEvent.setup();
    const unsubscribe = vi.fn();
    let push: ((text: string) => void) | null = null;
    const subscribe = vi.fn((onAlert: (text: string) => void) => {
      push = onAlert;
      return unsubscribe;
    });

    const { unmount } = render(<MonitorPanel subscribe={subscribe} />);

    act(() => push!("Disk 80%"));
    act(() => push!("Disk 85%"));
    expect(
      texts("listitem"),
      "two alerts arrived through one subscription that was opened before " +
        "either of them. A handler that computes the next list from the list it " +
        "closed over keeps rebuilding it from the empty array it saw when it " +
        "was created, so only the newest alert ever survives (README ex8)",
    ).toEqual(["Disk 80%", "Disk 85%"]);
    expect(screen.getByRole("status")).toHaveTextContent("0 hidden while muted");

    await user.click(screen.getByRole("button", { name: "Mute" }));
    act(() => push!("Disk 90%"));
    act(() => push!("Disk 95%"));
    expect(texts("listitem"), "muted alerts are counted, not listed").toEqual([
      "Disk 80%",
      "Disk 85%",
    ]);
    expect(
      screen.getByRole("status"),
      "and the handler has to see the mute that was switched on after it was " +
        "registered",
    ).toHaveTextContent("2 hidden while muted");

    await user.click(screen.getByRole("button", { name: "Unmute" }));
    act(() => push!("Disk 99%"));
    expect(texts("listitem"), "unmuting starts listing them again").toEqual([
      "Disk 80%",
      "Disk 85%",
      "Disk 99%",
    ]);
    expect(
      subscribe,
      "and through all of that, one subscription. dispatch is guaranteed stable " +
        "by React, so an effect that depends on it never re-runs - which is the " +
        "whole reason this shape works",
    ).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(texts("listitem"), "clear empties the list").toEqual([]);
    expect(screen.getByRole("status"), "and the hidden count with it").toHaveTextContent(
      "0 hidden while muted",
    );

    unmount();
    expect(unsubscribe, "leaving closes the connection, once").toHaveBeenCalledTimes(1);
  }, 30000);
});
