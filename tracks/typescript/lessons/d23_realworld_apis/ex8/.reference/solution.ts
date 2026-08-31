// d23_realworld_apis / ex8 - reference solution (author only).

export const ENDPOINTS = {
  getUser: { method: "GET", path: "/users/:id" },
  createOrder: { method: "POST", path: "/orders" },
  getPost: { method: "GET", path: "/users/:userId/posts/:postId" },
} as const satisfies Record<string, { method: "GET" | "POST"; path: string }>;

export type EndpointName = keyof typeof ENDPOINTS;

type ParamNames<S extends string> = S extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ParamNames<Rest>
  : S extends `${string}:${infer Param}`
    ? Param
    : never;

export type PathParams<P extends string> = { [K in ParamNames<P>]: string };

export interface Client {
  call<K extends EndpointName>(
    name: K,
    params: PathParams<(typeof ENDPOINTS)[K]["path"]>,
  ): Promise<unknown>;
}

export function createClient(
  send: (method: string, url: string) => Promise<unknown>,
): Client {
  return {
    call<K extends EndpointName>(
      name: K,
      params: PathParams<(typeof ENDPOINTS)[K]["path"]>,
    ): Promise<unknown> {
      const endpoint = ENDPOINTS[name];
      const values = params as Record<string, string>;
      const url = endpoint.path
        .split("/")
        .map((segment) => (segment.startsWith(":") ? values[segment.slice(1)] : segment))
        .join("/");
      return send(endpoint.method, url);
    },
  };
}
