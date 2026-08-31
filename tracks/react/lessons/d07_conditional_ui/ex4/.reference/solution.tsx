// d07_conditional_ui / ex4 - reference solution.

type Order =
  | { status: "pending" }
  | { status: "shipped"; carrier: string; trackingUrl: string }
  | { status: "delivered"; deliveredAt: string; deliveredOn: string }
  | { status: "cancelled"; reason: string };

export function OrderStatus({ order }: { order: Order }) {
  switch (order.status) {
    case "pending":
      return <p>Placing order</p>;
    case "shipped":
      return <a href={order.trackingUrl}>Track with {order.carrier}</a>;
    case "delivered":
      return (
        <p>
          Delivered <time dateTime={order.deliveredAt}>{order.deliveredOn}</time>
        </p>
      );
    case "cancelled":
      return <p role="alert">Cancelled: {order.reason}</p>;
  }
}
