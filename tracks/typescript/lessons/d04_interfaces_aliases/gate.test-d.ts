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
