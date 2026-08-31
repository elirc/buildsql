// d08_literals_const_enums / ex3 - reference solution (author only).

export enum Lane {
  Left = "left",
  Center = "center",
  Right = "right",
}

const LANES: readonly Lane[] = [Lane.Left, Lane.Center, Lane.Right];

export function laneOffset(lane: Lane): number {
  return LANES.indexOf(lane) - 1;
}

export function shift(lane: Lane, by: number): Lane {
  const target = LANES.indexOf(lane) + by;
  const clamped = Math.min(LANES.length - 1, Math.max(0, target));
  return LANES[clamped];
}
