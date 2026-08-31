// d23_realworld_apis / ex6 - reference solution (author only).

export type Method = "GET" | "POST";

export function describeRequest<M extends Method>(
  method: M,
  url: string,
  ...rest: M extends "GET" ? [] : [body: string]
): string {
  const [body] = rest as unknown as [string | undefined];
  return body === undefined ? method + " " + url : method + " " + url + " " + body;
}
