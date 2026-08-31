// d07_conditional_ui / ex4 - four statuses, four different shapes.
// See tracks/react/lessons/d07_conditional_ui/README.md, "Exercise 4".

type Order =
  | { status: "pending" }
  | { status: "shipped"; carrier: string; trackingUrl: string }
  | { status: "delivered"; deliveredAt: string; deliveredOn: string }
  | { status: "cancelled"; reason: string };

export function OrderStatus({ order }: { order: Order }) {
  return <p>{order.status}</p>;
}
