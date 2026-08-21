# i1 — Interview concepts

The main course is behind you. This part is about being able to *say* what you
know, under time pressure, to somebody who is deciding whether to hire you.

Those are different skills. You can fix a stale closure and still fumble the
sentence that explains it. Interviewers are listening for the mechanism —
"the callback was created during one render and captured that render's
`count`" — and a candidate who says it plainly reads as senior even when the
code takes them two minutes.

So this lesson is mostly `reading.md`, which carries **a bank of 55 questions
with model answers**, grouped by topic, each tagged by how often it actually
gets asked:

| tag | meaning |
|---|---|
| ⭐⭐⭐ | expect it in most React interviews. Know it cold. |
| ⭐⭐ | common, especially for mid-level and above. |
| ⭐ | asked when the conversation goes deep, or by a specialist. |

Each answer is written the way a strong candidate would actually say it — three
to six sentences, one concrete example, and the **follow-up** the interviewer
will reach for next. Every question names the lesson that teaches it, so a
question you cannot answer turns straight into "redo `06_effects`".

The five graded exercises here are the concepts that can be checked in code:
four bugs of the kind interviewers put in front of you, and one code review.
Each one compiles and is wrong, and none of them takes more than a few lines to
fix — because the point is the diagnosis.

## How to use the question bank

Do not read it like a document. Work it like flashcards:

1. Open `reading.md` — `uv run dojo read react i1_interview_concepts` — and
   cover everything below a question.
2. **Say the answer out loud.** Not in your head. The gap between "I know this"
   and "I can say this" is the entire reason people fail interviews they were
   qualified for, and it only closes by talking.
3. Uncover, and compare. Did you name the mechanism, or only the fix? Did you
   have an example ready? Could you answer the follow-up?
4. Mark the ⭐⭐⭐ questions you fumbled and come back to them tomorrow. The
   review ladder does this for the exercises; do it yourself for the prose.

A pass through all 55 takes about an hour. A pass through the ⭐⭐⭐ subset
takes fifteen minutes, and is the thing to do the morning of an interview.

## Exercise 1 — the stale-closure counter

Edit `ex1/solution.tsx`.

> *"This counter is supposed to tick up every second. It stops at 1. Talk me
> through why, then fix it."*

Answer the "why" out loud before you edit anything — that is what is being
marked. Then make it count 3 after three seconds, and keep going.

```
uv run dojo test react i1_interview_concepts ex1
```

## Exercise 2 — index keys

Edit `ex2/solution.tsx`.

> *"Type something into the Zebra row, then hit Sort. Where did your text go,
> and why?"*

Each row has an uncontrolled text box. Sorting must not move what the user
typed into a different row.

```
uv run dojo test react i1_interview_concepts ex2
```

## Exercise 3 — controlled vs uncontrolled

Edit `ex3/solution.tsx`.

> *"Reset does nothing. React clearly knows the value — the character count is
> right. So who is deciding what the box displays?"*

After Reset, the field must be empty and the counter must read `0 characters`.

```
uv run dojo test react i1_interview_concepts ex3
```

## Exercise 4 — the effect that should not exist

Edit `ex4/solution.tsx`.

> *"What's wrong with this component? It works."*

It does work, and it renders twice for every change, showing `Total: 0` for a
frame. The gate counts renders and requires exactly one per change.

```
uv run dojo test react i1_interview_concepts ex4
```

## Review — read this effect back to me

`review1/solution.tsx`.

> *"Code review this for me. Anything you'd change?"*

There are two defects and they compound. The gate re-renders the component and
then unmounts it, checking how many times one keystroke fires the handler.

```
uv run dojo test react i1_interview_concepts review1
```

## The gate

This is the entire gate, `gate.test.tsx`:

<!-- GATE:BEGIN -->

```tsx
// Gate for react/i1_interview_concepts. Quoted verbatim in README.md.
//
// Four bugs an interviewer is likely to put in front of you, plus one for the
// review ladder. Each is a complete component that compiles and is wrong.
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { StaleCounter } from "./ex1/solution";
import { ReorderableList } from "./ex2/solution";
import { NicknameForm } from "./ex3/solution";
import { OrderSummary } from "./ex4/solution";
import { ShortcutListener } from "./review1/solution";

afterEach(() => {
  vi.useRealTimers();
});

describe("i1_interview_concepts", () => {
  test("ex1 - StaleCounter keeps counting past one", () => {
    vi.useFakeTimers();
    render(<StaleCounter />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(
      screen.getByRole("status"),
      "three seconds, three ticks, and it reads 1. The function handed to " +
        "setInterval was created during the first render and captured count as " +
        "0 forever, so every tick sets it to 0 + 1. Say that sentence out loud - " +
        "it is the answer they are listening for (README ex1)",
    ).toHaveTextContent("3");

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("status"), "and it keeps going").toHaveTextContent("5");
  });

  test("ex2 - ReorderableList keeps each row attached to its own item", async () => {
    const user = userEvent.setup();
    render(
      <ReorderableList
        initialItems={[
          { id: "z", label: "Zebra" },
          { id: "a", label: "Apple" },
          { id: "m", label: "Mango" },
        ]}
      />,
    );

    await user.type(screen.getByLabelText("Zebra"), "notes");
    await user.click(screen.getByRole("button", { name: "Sort A-Z" }));

    expect(
      screen.queryAllByRole("textbox").length,
      "sorting must not add or drop rows",
    ).toBe(3);
    expect(
      screen.getByLabelText("Zebra"),
      "the text you typed is now in somebody else's box. The list is keyed by " +
        "position, so React thinks the row that used to be first is the same " +
        "row and reuses its DOM node - key by identity (README ex2)",
    ).toHaveValue("notes");
    expect(
      screen.getByLabelText("Apple"),
      "and the row that moved into first place must still be empty",
    ).toHaveValue("");
  }, 20000);

  test("ex3 - NicknameForm can actually be reset", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<NicknameForm onSave={onSave} />);

    await user.type(screen.getByLabelText("Nickname"), "ada");
    expect(screen.getByRole("status"), "the counter follows the field").toHaveTextContent(
      "3 characters",
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave, "Save hands over what is in the field").toHaveBeenCalledWith("ada");

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(
      screen.getByLabelText("Nickname"),
      "Reset emptied the state and the box still shows ada. defaultValue is " +
        "only read once, when the DOM node is created - after that the browser " +
        "owns the value and React cannot put it back (README ex3)",
    ).toHaveValue("");
    expect(screen.getByRole("status"), "and the counter agrees").toHaveTextContent(
      "0 characters",
    );
  }, 20000);

  test("ex4 - OrderSummary computes the total without a second render", () => {
    const onRender = vi.fn();
    const items = [
      { name: "Mug", price: 12 },
      { name: "Poster", price: 18 },
    ];

    const { rerender } = render(<OrderSummary items={items} onRender={onRender} />);

    expect(screen.getByRole("status"), "the total is the sum of the prices").toHaveTextContent(
      "Total: 30",
    );
    expect(
      onRender,
      "rendering this component twice means the user saw Total: 0 first. The " +
        "total is not state - it is something you can work out from the items " +
        "you were given, during the render that needs it (README ex4)",
    ).toHaveBeenCalledTimes(1);

    rerender(<OrderSummary items={[{ name: "Pen", price: 4 }]} onRender={onRender} />);
    expect(screen.getByRole("status"), "new items, new total").toHaveTextContent("Total: 4");
    expect(onRender, "and still one render per change").toHaveBeenCalledTimes(2);
  });

  test("review1 - ShortcutListener subscribes once and stops when it leaves", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const { rerender, unmount } = render(<ShortcutListener onSave={onSave} />);

    await user.keyboard("s");
    expect(onSave, "pressing s saves").toHaveBeenCalledTimes(1);

    rerender(<ShortcutListener onSave={onSave} />);
    await user.keyboard("s");
    expect(
      onSave,
      "one keystroke fired the handler twice, so the re-render added a second " +
        "listener next to the first. An effect with no dependency array runs " +
        "after every render, and one with no cleanup never takes anything back",
    ).toHaveBeenCalledTimes(2);

    unmount();
    await user.keyboard("s");
    expect(
      onSave,
      "and a component that is gone must not still be listening",
    ).toHaveBeenCalledTimes(2);
  }, 20000);
});
```

<!-- GATE:END -->

In plain English:

- **ex1** uses fake timers to move three seconds instantly and requires the
  display to read `3`, then two more and requires `5`.
- **ex2** types into the box labelled `Zebra`, sorts, and asks the DOM for "the
  box labelled Zebra" again — with index keys, that is a different node.
- **ex3** types, saves, resets, and checks both the field and the counter.
- **ex4** counts renders: one for the initial mount, one more for a prop change,
  and no extras.
- **review1** presses `s`, re-renders, presses `s` again and requires exactly
  one more call (not two), then unmounts and requires none.

## The teaching point

Interviews reward *narration*. When you are handed a broken component, the
sequence that scores is: say what you observe, say what you think is causing
it, say how you would confirm, then fix. Silence while you type reads as
guessing, even when you are right.

The five bugs here were chosen because each has a one-line fix and a
three-sentence explanation, and the explanation is worth far more than the fix.
Anyone can memorise "use the updater form". The candidate who gets the offer is
the one who says *why* the closure was stale, and what the alternative fix would
have cost.

Next: **i2_interview_drills**, where you build things from scratch against a
clock.
