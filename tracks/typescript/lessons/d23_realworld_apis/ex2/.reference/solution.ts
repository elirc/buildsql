// d23_realworld_apis / ex2 - reference solution (author only).

export interface HttpResponse {
  status: number;
  body: unknown;
}

export type Fetcher = (url: string) => Promise<HttpResponse>;

export type Fetched<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "http" | "shape"; status: number };

export async function getJson<T>(
  fetcher: Fetcher,
  url: string,
  guard: (value: unknown) => value is T,
): Promise<Fetched<T>> {
  const response = await fetcher(url);
  if (response.status < 200 || response.status >= 300) {
    return { ok: false, reason: "http", status: response.status };
  }
  if (!guard(response.body)) {
    return { ok: false, reason: "shape", status: response.status };
  }
  return { ok: true, data: response.body };
}
