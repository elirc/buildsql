// d19_unknown_any_never / ex3 - never as the exhaustiveness check.
// See lessons/d19_unknown_any_never/README.md, "ex3".
//
// The stub takes unknown and returns void, so it accepts
// anything and proves nothing.

export type Shipment =
  | { status: "pending" }
  | { status: "shipped"; trackingId: string }
  | { status: "delivered"; signedBy: string }
  | { status: "cancelled"; reason: string };

export function assertUnreachable(value: unknown): void {
  throw new Error("ex3: assertUnreachable() is not implemented yet - edit this file.");
}

export function describeShipment(shipment: Shipment): string {
  throw new Error("ex3: describeShipment() is not implemented yet - edit this file.");
}
