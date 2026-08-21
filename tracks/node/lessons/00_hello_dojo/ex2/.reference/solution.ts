// 00_hello_dojo / ex2 - reference solution (author only, used by `dojo verify`).

export function sumOfArgs(argv: string[]): number {
  return argv.slice(2).reduce((total, arg) => total + Number(arg), 0);
}
