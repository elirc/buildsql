// d02_functions_signatures / ex8 - reference solution (author only).

export type Middleware = (input: string, next: (value: string) => string) => string;

export function runMiddleware(input: string, middleware: readonly Middleware[]): string {
  const dispatch = (index: number): ((value: string) => string) => {
    return (value: string): string => {
      const handler = middleware[index];
      if (handler === undefined) {
        return value;
      }
      return handler(value, dispatch(index + 1));
    };
  };
  return dispatch(0)(input);
}
