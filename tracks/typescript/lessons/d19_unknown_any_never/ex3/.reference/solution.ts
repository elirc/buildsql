// d19_unknown_any_never / ex3 - reference solution (author only).

export type Shipment =
  | { status: "pending" }
  | { status: "shipped"; trackingId: string }
  | { status: "delivered"; signedBy: string }
  | { status: "cancelled"; reason: string };

export function assertUnreachable(value: never): never {
  throw new Error("assertUnreachable: unhandled value " + String(value));
}

export function describeShipment(shipment: Shipment): string {
  switch (shipment.status) {
    case "pending":
      return "waiting to ship";
    case "shipped":
      return "in transit as " + shipment.trackingId;
    case "delivered":
      return "delivered to " + shipment.signedBy;
    case "cancelled":
      return "cancelled: " + shipment.reason;
    default:
      return assertUnreachable(shipment);
  }
}
