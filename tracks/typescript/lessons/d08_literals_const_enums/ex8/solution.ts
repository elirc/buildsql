// d08_literals_const_enums / ex8 - two unions, one week, one predicate.
// See lessons/d08_literals_const_enums/README.md, "ex8".
//
// Both halves are `string`, so Day is `string` too and nothing narrows.

export type Weekday = string;

export type Weekend = string;

export type Day = Weekday | Weekend;

export function isWeekend(day: Day): boolean {
  throw new Error("ex8: isWeekend() is not implemented yet - edit this file.");
}

export function shiftDay(day: Day, by: number): Day {
  throw new Error("ex8: shiftDay() is not implemented yet - edit this file.");
}

export function nextWorkday(day: Day): Weekday {
  throw new Error("ex8: nextWorkday() is not implemented yet - edit this file.");
}
