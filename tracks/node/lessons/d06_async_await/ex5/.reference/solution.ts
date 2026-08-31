// d06_async_await / ex5 - reference solution (author only, used by `dojo verify`).

export async function sumUntil(
  source: AsyncIterable<number>,
  stopAt: number,
): Promise<number> {
  let total = 0;

  // `break` out of a for-await calls the iterator's return() for you. A
  // hand-rolled `while (true) { const { value, done } = await it.next(); }`
  // does not, and that is how a database cursor stays open.
  for await (const value of source) {
    if (value === stopAt) break;
    total += value;
  }

  return total;
}
