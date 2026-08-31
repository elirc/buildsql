// d24_mixed_gauntlet / ex8 - reference solution (author only).

export type PipeResult<T, Fns extends readonly unknown[]> = Fns extends readonly [
  (arg: never) => infer R,
  ...infer Rest,
]
  ? PipeResult<Awaited<R>, Rest>
  : T;

export function pipeAsync<T, Fns extends readonly ((arg: never) => unknown)[]>(
  input: T,
  ...fns: Fns
): Promise<PipeResult<T, Fns>> {
  const run = async (): Promise<unknown> => {
    let value: unknown = input;
    for (const fn of fns) {
      value = await (fn as (arg: unknown) => unknown)(value);
    }
    return value;
  };
  return run() as Promise<PipeResult<T, Fns>>;
}
