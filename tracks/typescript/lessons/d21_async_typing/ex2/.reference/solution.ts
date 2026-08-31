// d21_async_typing / ex2 - reference solution (author only).

export interface Profile {
  user: { id: string; name: string };
  orders: readonly { id: string }[];
  unread: number;
}

export async function loadProfile(
  loadUser: () => Promise<{ id: string; name: string }>,
  loadOrders: () => Promise<readonly { id: string }[]>,
  loadUnread: () => Promise<number>,
): Promise<Profile> {
  const [user, orders, unread] = await Promise.all([loadUser(), loadOrders(), loadUnread()]);
  return { user, orders, unread };
}
