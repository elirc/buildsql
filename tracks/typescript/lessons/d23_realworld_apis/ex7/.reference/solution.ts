// d23_realworld_apis / ex7 - reference solution (author only).

type ParamNames<S extends string> = S extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ParamNames<Rest>
  : S extends `${string}:${infer Param}`
    ? Param
    : never;

export type PathParams<P extends string> = { [K in ParamNames<P>]: string };

export interface Route<P extends string, R> {
  path: P;
  run(url: string): R | undefined;
}

export function defineRoute<P extends string, R>(
  path: P,
  handler: (params: PathParams<P>) => R,
): Route<P, R> {
  const pattern = path.split("/");
  return {
    path,
    run(url: string): R | undefined {
      const parts = url.split("/");
      if (parts.length !== pattern.length) {
        return undefined;
      }
      const params: Record<string, string> = {};
      for (let index = 0; index < pattern.length; index += 1) {
        const segment = pattern[index];
        if (segment.startsWith(":")) {
          params[segment.slice(1)] = parts[index];
        } else if (segment !== parts[index]) {
          return undefined;
        }
      }
      return handler(params as PathParams<P>);
    },
  };
}
