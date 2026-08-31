# d04 - Interfaces and type aliases (drill set)

Eight problems on the declaration side of the language: extending an interface,
intersecting two aliases, call and construct signatures, an index signature next
to a named member, declaration merging, and `implements`. They drill lesson
**03_objects_interfaces**; go back to it first if you cannot say what an
interface can do that a `type` cannot.

The type gate is doing most of the marking in this set. Read
`gate.test-d.ts` as part of every prompt.

## ex1 - one interface built on another

`Person` has a `name`. `Player` adds a `rating` and an optional `federation`.
`describePlayer(player)` returns `"<name>, <rating>"`, or
`"<name> (<federation>), <rating>"` when there is a federation. An empty
federation counts as none.

Edit `ex1/solution.ts`, where `rating` currently says `unknown`.

```
uv run dojo test typescript d04_interfaces_aliases ex1
```

## ex2 - an intersection of two aliases

`Game` is `{ white, black, moves }`. `Timestamped` is `{ createdAt }`.
`GameRecord` is exactly their intersection, and `stamp(game, createdAt)`
produces one without modifying the game it was given.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d04_interfaces_aliases ex2
```

## ex3 - an interface you can call

`Scorer` is callable - `(white: number, black: number) => string`, rendering
`"3-1"` - **and** carries a `label` and a `total` that counts how many times it
has been called. `makeScorer(label)` returns one, and two scorers never share a
count.

Edit `ex3/solution.ts`. The shipped interface has the two members and no call
signature.

```
uv run dojo test typescript d04_interfaces_aliases ex3
```

## ex4 - an index signature beside a named member

`OpeningStats` has a `total: number` **and** an index signature mapping any
opening name to a count. `topOpening(stats)` returns the most-played opening,
skipping `total`; ties are broken alphabetically, and a table with no openings
returns `""`.

- `{ total: 6, Sicilian: 3, French: 2, London: 1 }` -> `"Sicilian"`
- `{ total: 4, Sicilian: 2, French: 2 }` -> `"French"`
- `{ total: 0 }` -> `""`

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d04_interfaces_aliases ex4
```

## ex5 - declaration merging

The first `ClubConfig` declaration is marked as shipped by a library: leave it
alone. Add a **second** `interface ClubConfig` declaration in the same file
contributing `maxPlayers: number` and `rated: boolean` - two declarations of one
interface merge into a single type, which is the one thing an interface can do
that a `type` alias cannot.

Then `describeClub(config)` returns
`"<name>: up to <maxPlayers> players, <rated|casual>"`.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d04_interfaces_aliases ex5
```

## ex6 - a class that implements an interface

`Ledger` declares `record(white, black, points)`, `pointsFor(player)` and
`standings()`. `points` is what **white** scored (1, 0.5 or 0); black scores
`1 - points`. `pointsFor` returns `0` for a player who has never appeared.
`standings()` is sorted by points descending, then by name ascending.

Declare `ArrayLedger implements Ledger` and make the type gate's
`const ledger: Ledger = new ArrayLedger()` compile.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d04_interfaces_aliases ex6
```

## ex7 - a construct signature

`Clock` is an instance type. Write `ClockConstructor` - the type of a **class**
that produces one from a start time - and `runClock(ctor, startedAt, ticks)`,
which builds an instance, ticks it that many times and returns the last value.
`ticks <= 0` returns `startedAt` unchanged.

`StepClock` is written for you; the gate also passes a class it defines itself,
which is what a construct signature is for.

Edit `ex7/solution.ts`, where `ClockConstructor` is currently an ordinary method
signature.

```
uv run dojo test typescript d04_interfaces_aliases ex7
```

## ex8 - the next round of a bracket

`nextRound(round, name)` collects the winners of `round.matches`, in order, and
pairs them: first with second, third with fourth, and so on. An odd winner gets
a bye - a match against `""` with the win already recorded. A match with no
winner sends nobody through. The round you were given must come back untouched.

Both `Match` and `Round` are `readonly` throughout - two modifiers on `Round`,
three on `Match`.

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d04_interfaces_aliases ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
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
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d04_interfaces_aliases. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Person, Player } from "./ex1/solution";
import { describePlayer } from "./ex1/solution";
import type { Game, GameRecord, Timestamped } from "./ex2/solution";
import { stamp } from "./ex2/solution";
import type { Scorer } from "./ex3/solution";
import { makeScorer } from "./ex3/solution";
import type { OpeningStats } from "./ex4/solution";
import type { ClubConfig } from "./ex5/solution";
import type { Ledger } from "./ex6/solution";
import { ArrayLedger } from "./ex6/solution";
import type { Clock, ClockConstructor } from "./ex7/solution";
import { StepClock } from "./ex7/solution";
import type { Match, Round } from "./ex8/solution";
import { nextRound } from "./ex8/solution";

describe("d04_interfaces_aliases", () => {
  test("ex1 - Player carries everything a Person has", () => {
    const player: Player = { name: "Ada", rating: 1780 };
    const person: Person = player;
    expectTypeOf(person.name).toEqualTypeOf<string>();
    expectTypeOf<Player["rating"]>().toEqualTypeOf<number>();
    expectTypeOf<Player["federation"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf(describePlayer).returns.toEqualTypeOf<string>();
    // @ts-expect-error - a Person is not automatically a Player.
    const wrong: Player = { name: "Ada" };
  });

  test("ex2 - GameRecord is the intersection of both halves", () => {
    expectTypeOf<GameRecord>().toEqualTypeOf<Game & Timestamped>();
    expectTypeOf(stamp({ white: "a", black: "b", moves: 1 }, "x")).toEqualTypeOf<GameRecord>();
    expectTypeOf<GameRecord["createdAt"]>().toEqualTypeOf<string>();
    expectTypeOf<GameRecord["moves"]>().toEqualTypeOf<number>();
    // @ts-expect-error - a record without a timestamp is only half of one.
    const wrong: GameRecord = { white: "a", black: "b", moves: 1 };
  });

  test("ex3 - Scorer is callable and has members", () => {
    expectTypeOf(makeScorer("x")).toEqualTypeOf<Scorer>();
    expectTypeOf(makeScorer("x")(1, 0)).toEqualTypeOf<string>();
    expectTypeOf(makeScorer("x").label).toEqualTypeOf<string>();
    expectTypeOf(makeScorer("x").total).toEqualTypeOf<number>();
    // @ts-expect-error - the scores are numbers.
    makeScorer("x")("1", 0);
  });

  test("ex4 - OpeningStats mixes a named member with an index signature", () => {
    const stats: OpeningStats = { total: 3, Sicilian: 3 };
    expectTypeOf(stats.total).toEqualTypeOf<number>();
    expectTypeOf(stats["Kings Gambit"]).toEqualTypeOf<number>();
    // @ts-expect-error - every value in this table is a count.
    const wrong: OpeningStats = { total: 1, Sicilian: "three" };
  });

  test("ex5 - ClubConfig is the merge of both declarations", () => {
    const config: ClubConfig = { name: "Hastings", maxPlayers: 32, rated: true };
    expectTypeOf(config.name).toEqualTypeOf<string>();
    expectTypeOf(config.maxPlayers).toEqualTypeOf<number>();
    expectTypeOf(config.rated).toEqualTypeOf<boolean>();
    // @ts-expect-error - all three members are required after the merge.
    const wrong: ClubConfig = { name: "Hastings" };
  });

  test("ex6 - ArrayLedger is assignable to Ledger", () => {
    const ledger: Ledger = new ArrayLedger();
    expectTypeOf(ledger.standings()).toEqualTypeOf<{ player: string; points: number }[]>();
    expectTypeOf(ledger.pointsFor("a")).toEqualTypeOf<number>();
    expectTypeOf(ledger.record("a", "b", 1)).toEqualTypeOf<void>();
    // @ts-expect-error - the score is a number, not the text of one.
    ledger.record("a", "b", "1");
  });

  test("ex7 - ClockConstructor is a construct signature", () => {
    const ctor: ClockConstructor = StepClock;
    expectTypeOf(new ctor(0)).toEqualTypeOf<Clock>();
    expectTypeOf(new ctor(0).tick()).toEqualTypeOf<number>();
    // @ts-expect-error - the instance type has to be a Clock, and this one has no tick().
    const broken: ClockConstructor = class Broken {
      readonly startedAt = 0;
    };
  });

  test("ex8 - Round and Match are readonly all the way down", () => {
    const match: Match = { white: "a", black: "b" };
    const round: Round = { name: "R1", matches: [match] };
    expectTypeOf(nextRound(round, "R2")).toEqualTypeOf<Round>();
    expectTypeOf<Match["winner"]>().toEqualTypeOf<string | undefined>();
    // @ts-expect-error - a match is readonly.
    match.white = "z";
    // @ts-expect-error - the match list is readonly, so push is not on it.
    round.matches.push(match);
  });
});
```

An exercise is green only when both gates agree about it.
