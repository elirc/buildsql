// 00_hello_dojo / ex3 - reference solution (author only, used by `dojo verify`).

export async function totalOf(promises: Promise<number>[]): Promise<number> {
  const values = await Promise.all(promises);
  return values.reduce((total, value) => total + value, 0);
}
