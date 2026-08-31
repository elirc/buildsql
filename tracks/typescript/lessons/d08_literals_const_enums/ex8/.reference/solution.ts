// d08_literals_const_enums / ex8 - reference solution (author only).

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri";

export type Weekend = "sat" | "sun";

export type Day = Weekday | Weekend;

const DAYS: readonly Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function isWeekend(day: Day): day is Weekend {
  return day === "sat" || day === "sun";
}

export function shiftDay(day: Day, by: number): Day {
  const index = DAYS.indexOf(day);
  const shifted = (((index + by) % DAYS.length) + DAYS.length) % DAYS.length;
  return DAYS[shifted];
}

export function nextWorkday(day: Day): Weekday {
  let candidate: Day = day;
  for (let i = 0; i < DAYS.length; i += 1) {
    candidate = shiftDay(candidate, 1);
    if (!isWeekend(candidate)) {
      return candidate;
    }
  }
  return "mon";
}
