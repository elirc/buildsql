// 07_streams_2 / ex4 - reference solution (author only, used by `dojo verify`).

export async function* withLineNumbers(
  source: AsyncIterable<unknown>,
): AsyncGenerator<string> {
  let number = 0;
  for await (const item of source) {
    number += 1;
    yield `${number}: ${String(item)}`;
  }
}
