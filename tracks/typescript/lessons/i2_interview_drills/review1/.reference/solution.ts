// i2_interview_drills / review1 - reference solution (author only).

export function mapValues<T extends object, U>(
  source: T,
  transform: (value: T[keyof T], key: keyof T & string) => U,
): Record<keyof T, U> {
  const result = {} as Record<keyof T, U>;
  for (const key of Object.keys(source) as (keyof T & string)[]) {
    result[key] = transform(source[key], key);
  }
  return result;
}
