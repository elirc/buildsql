// d23_realworld_apis / ex8 - a client built from an endpoint table.
// See lessons/d23_realworld_apis/README.md, "ex8".
//
// The stub annotates the endpoint table, so every name is
// allowed and every params object is, and createClient() throws.

export const ENDPOINTS: Record<string, { method: "GET" | "POST"; path: string }> = {
  getUser: { method: "GET", path: "/users/:id" },
  createOrder: { method: "POST", path: "/orders" },
  getPost: { method: "GET", path: "/users/:userId/posts/:postId" },
};

export type EndpointName = keyof typeof ENDPOINTS;

export type PathParams<P extends string> = Record<string, string>;

export interface Client {
  call<K extends EndpointName>(
    name: K,
    params: PathParams<(typeof ENDPOINTS)[K]["path"]>,
  ): Promise<unknown>;
}

export function createClient(
  send: (method: string, url: string) => Promise<unknown>,
): Client {
  throw new Error("ex8: createClient() is not implemented yet - edit this file.");
}
