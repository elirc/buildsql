// d21_async_typing / ex2 - three loaders, one wait.
// See lessons/d21_async_typing/README.md, "ex2".
//
// The stub promises unknown and throws, so there is nothing to
// start and nothing to assemble.

export interface Profile {
  user: { id: string; name: string };
  orders: readonly { id: string }[];
  unread: number;
}

export async function loadProfile(
  loadUser: () => Promise<{ id: string; name: string }>,
  loadOrders: () => Promise<readonly { id: string }[]>,
  loadUnread: () => Promise<number>,
): Promise<unknown> {
  throw new Error("ex2: loadProfile() is not implemented yet - edit this file.");
}
