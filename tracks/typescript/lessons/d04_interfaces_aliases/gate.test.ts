// Gate for typescript/d04_interfaces_aliases. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { describePlayer } from "./ex1/solution";
import { stamp } from "./ex2/solution";
import { makeScorer } from "./ex3/solution";
import { topOpening } from "./ex4/solution";
import { describeClub } from "./ex5/solution";
import { ArrayLedger } from "./ex6/solution";
import type { Clock } from "./ex7/solution";
import { StepClock, runClock } from "./ex7/solution";
import { nextRound } from "./ex8/solution";

describe("d04_interfaces_aliases", () => {
  test("ex1 - describePlayer() reads members from both halves", () => {
    expect(
      describePlayer({ name: "Ada", rating: 1780 }),
      "the name comes from Person, the rating from Player",
    ).toBe("Ada, 1780");
    expect(
      describePlayer({ name: "Eli", rating: 2010, federation: "GER" }),
      "a federation, when there is one, goes in brackets after the name",
    ).toBe("Eli (GER), 2010");
    expect(
      describePlayer({ name: "Grace", rating: 1500, federation: "" }),
      "an empty federation is no federation - reread README ex1",
    ).toBe("Grace, 1500");
  });

  test("ex2 - stamp() produces a value that satisfies both halves", () => {
    expect(
      stamp({ white: "Ada", black: "Eli", moves: 41 }, "2026-03-01"),
      "every member of the game survives, and the timestamp is added",
    ).toEqual({ white: "Ada", black: "Eli", moves: 41, createdAt: "2026-03-01" });
    const game = { white: "Ada", black: "Eli", moves: 41 };
    const stamped = stamp(game, "2026-03-01");
    expect(stamped, "the result is a new object, not the game you were handed").not.toBe(game);
    expect(
      Object.keys(game),
      "and the game itself gains nothing - no createdAt was written into it",
    ).toEqual(["white", "black", "moves"]);
  });

  test("ex3 - makeScorer() returns something callable that also has members", () => {
    const scorer = makeScorer("round 1");
    expect(scorer(3, 1), "calling it formats the score").toBe("3-1");
    expect(scorer.label, "and it carries the label it was made with").toBe("round 1");
    expect(scorer.total, "one call so far").toBe(1);
    expect(scorer(0, 0), "a drawn-looking score formats the same way").toBe("0-0");
    expect(scorer.total, "two calls now - the counter lives on the function itself").toBe(2);

    const other = makeScorer("round 2");
    expect(other.total, "a second scorer starts its own count at zero").toBe(0);
    expect(scorer.total, "and the first scorer is unaffected by it").toBe(2);
  });

  test("ex4 - topOpening() ignores the named member", () => {
    expect(
      topOpening({ total: 6, Sicilian: 3, French: 2, London: 1 }),
      "the most played opening, and total is not an opening",
    ).toBe("Sicilian");
    expect(
      topOpening({ total: 4, Sicilian: 2, French: 2 }),
      "on a tie the alphabetically first name wins (README ex4)",
    ).toBe("French");
    expect(
      topOpening({ total: 99, Caro: 0 }),
      "an opening played zero times still beats no opening at all",
    ).toBe("Caro");
    expect(
      topOpening({ total: 0 }),
      "with no openings recorded there is nothing to name, so the empty string",
    ).toBe("");
  });

  test("ex5 - describeClub() sees every merged member", () => {
    expect(
      describeClub({ name: "Hastings", maxPlayers: 32, rated: true }),
      "name, capacity and the rated wording",
    ).toBe("Hastings: up to 32 players, rated");
    expect(
      describeClub({ name: "Tuesday Casuals", maxPlayers: 8, rated: false }),
      "an unrated club reads casual",
    ).toBe("Tuesday Casuals: up to 8 players, casual");
  });

  test("ex6 - ArrayLedger implements the whole Ledger interface", () => {
    const ledger = new ArrayLedger();
    ledger.record("Ada", "Eli", 1);
    ledger.record("Eli", "Ada", 0.5);
    expect(
      ledger.pointsFor("Ada"),
      "Ada won one and drew one: 1 plus 0.5 - the loser of a game scores 1 minus " +
        "the winner score",
    ).toBe(1.5);
    expect(ledger.pointsFor("Eli"), "Eli lost one and drew one: 0 plus 0.5").toBe(0.5);
    expect(
      ledger.pointsFor("nobody"),
      "a player who has never appeared has no points, not undefined",
    ).toBe(0);
    expect(ledger.standings(), "sorted by points, highest first").toEqual([
      { player: "Ada", points: 1.5 },
      { player: "Eli", points: 0.5 },
    ]);

    const tied = new ArrayLedger();
    tied.record("Zoe", "Ada", 0.5);
    expect(
      tied.standings(),
      "equal points are broken by name, alphabetically - reread README ex6",
    ).toEqual([
      { player: "Ada", points: 0.5 },
      { player: "Zoe", points: 0.5 },
    ]);
    expect(new ArrayLedger().standings(), "a fresh ledger has an empty table").toEqual([]);
  });

  test("ex7 - runClock() builds a clock from its constructor", () => {
    expect(runClock(StepClock, 10, 3), "three ticks from 10 is 13").toBe(13);
    expect(runClock(StepClock, 10, 1), "one tick from 10 is 11").toBe(11);
    expect(
      runClock(StepClock, 10, 0),
      "no ticks at all means the start time comes straight back",
    ).toBe(10);
    expect(runClock(StepClock, 10, -2), "a negative tick count is the same case").toBe(10);

    class DoubleClock implements Clock {
      readonly startedAt: number;
      private current: number;

      constructor(startedAt: number) {
        this.startedAt = startedAt;
        this.current = startedAt;
      }

      tick(): number {
        this.current *= 2;
        return this.current;
      }
    }
    expect(
      runClock(DoubleClock, 2, 3),
      "any class matching the construct signature works - that is the point of it",
    ).toBe(16);
  });

  test("ex8 - nextRound() pairs the winners in order", () => {
    const round = {
      name: "R1",
      matches: [
        { white: "a", black: "b", winner: "a" },
        { white: "c", black: "d", winner: "c" },
      ],
    };
    expect(
      nextRound(round, "R2"),
      "two winners meet each other, and the new match has no winner yet",
    ).toEqual({ name: "R2", matches: [{ white: "a", black: "c" }] });
    expect(
      round.matches.length,
      "the round you were handed is not modified - two matches, still",
    ).toBe(2);

    expect(
      nextRound(
        {
          name: "R1",
          matches: [
            { white: "a", black: "b", winner: "a" },
            { white: "c", black: "d", winner: "c" },
            { white: "e", black: "f", winner: "e" },
          ],
        },
        "R2",
      ),
      "an odd winner gets a bye: an empty opponent and the win already recorded",
    ).toEqual({
      name: "R2",
      matches: [
        { white: "a", black: "c" },
        { white: "e", black: "", winner: "e" },
      ],
    });

    expect(
      nextRound(
        {
          name: "R1",
          matches: [
            { white: "a", black: "b", winner: "a" },
            { white: "c", black: "d" },
          ],
        },
        "R2",
      ),
      "an unfinished match sends nobody through, so one winner is left with a bye",
    ).toEqual({ name: "R2", matches: [{ white: "a", black: "", winner: "a" }] });

    expect(
      nextRound({ name: "R1", matches: [{ white: "a", black: "b" }] }, "R2"),
      "no winners at all means an empty round, not a crash",
    ).toEqual({ name: "R2", matches: [] });
  });
});
