// 11_async_and_modules / ex2 - reference solution (author only).

export async function bothOf<A, B>(a: () => Promise<A>, b: () => Promise<B>): Promise<[A, B]> {
  return Promise.all([a(), b()]);
}
