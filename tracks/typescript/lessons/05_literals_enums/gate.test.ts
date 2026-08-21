// Gate for typescript/05_literals_enums. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { nextLevel } from "./ex1/solution";
import { TRACK_TITLES, titleOf } from "./ex2/solution";
import { Status, statusLabel } from "./ex3/solution";
import { HINT_TIERS, sortTiers } from "./challenge/solution";
import { verdictIcon } from "./review1/solution";

describe("05_literals_enums", () => {
  test("ex1 - nextLevel() walks the ladder and stops at the top", () => {
    expect(nextLevel("beginner"), "beginner is followed by intermediate").toBe("intermediate");
    expect(nextLevel("intermediate"), "intermediate is followed by advanced").toBe("advanced");
    expect(
      nextLevel("advanced"),
      "advanced is the top of the ladder, so it stays put - reread README ex1",
    ).toBe("advanced");
  });

  test("ex2 - titleOf() looks a track up in the frozen table", () => {
    expect(titleOf("typescript"), "the table maps 'typescript' to 'TypeScript'").toBe("TypeScript");
    expect(titleOf("node"), "and 'node' to 'Node.js', dot included").toBe("Node.js");
    expect(titleOf("react"), "and 'react' to 'React'").toBe("React");
    expect(
      TRACK_TITLES.node,
      "as const changes types, not values - the object still holds real strings",
    ).toBe("Node.js");
  });

  test("ex3 - statusLabel() covers all three enum members", () => {
    expect(statusLabel(Status.Draft), "a draft is labelled 'Draft (not visible)'").toBe(
      "Draft (not visible)",
    );
    expect(statusLabel(Status.Published), "published is just 'Published'").toBe("Published");
    expect(statusLabel(Status.Retired), "retired is 'Retired (archived)'").toBe(
      "Retired (archived)",
    );
    expect(
      Status.Published,
      "a string enum member IS its string at runtime - that is why it survives " +
        "JSON and a database column",
    ).toBe("published");
  });

  test("challenge - sortTiers() orders by the tier number", () => {
    expect(
      sortTiers(["almost", "nudge", "approach"]),
      "sorted by the numbers in HINT_TIERS: nudge(1), approach(2), almost(3)",
    ).toEqual(["nudge", "approach", "almost"]);
    const input = ["approach", "nudge"] as const;
    expect(sortTiers(input), "a two-element list sorts the same way").toEqual([
      "nudge",
      "approach",
    ]);
    expect(
      HINT_TIERS.almost,
      "the numbers are still numbers at runtime; as const only changed the types",
    ).toBe(3);
  });

  test("review1 - verdictIcon() maps three verdicts to three icons", () => {
    expect(verdictIcon("pass"), "a pass shows 'ok'").toBe("ok");
    expect(verdictIcon("fail"), "a fail shows 'x'").toBe("x");
    expect(verdictIcon("skip"), "a skip shows '-'").toBe("-");
  });
});
