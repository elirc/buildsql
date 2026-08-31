// d23_realworld_apis / ex2 - bad status against bad payload.
// See lessons/d23_realworld_apis/README.md, "ex2".
//
// The stub promises unknown and throws, so the caller cannot
// tell the two kinds of failure apart or reach the data.

export interface HttpResponse {
  status: number;
  body: unknown;
}

export type Fetcher = (url: string) => Promise<HttpResponse>;

export async function getJson<T>(
  fetcher: Fetcher,
  url: string,
  guard: (value: unknown) => value is T,
): Promise<unknown> {
  throw new Error("ex2: getJson() is not implemented yet - edit this file.");
}
