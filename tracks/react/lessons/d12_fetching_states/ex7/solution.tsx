// d12_fetching_states / ex7 - the second question depends on the first answer.
// See tracks/react/lessons/d12_fetching_states/README.md, "Exercise 7".
import { useEffect, useState } from "react";

export type Customer = { id: string; name: string };

export function CustomerOrders({
  customerId,
  fetchCustomer,
  fetchOrders,
}: {
  customerId: string;
  fetchCustomer: (customerId: string) => Promise<Customer>;
  fetchOrders: (customerId: string) => Promise<string[]>;
}) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<string[]>([]);

  useEffect(() => {
    fetchCustomer(customerId).then(setCustomer);
    fetchOrders(customerId).then(setOrders);
  }, [customerId, fetchCustomer, fetchOrders]);

  if (customer === null) {
    return <p role="status">Loading customer</p>;
  }

  return (
    <>
      <h2>{customer.name}</h2>
      <ul>
        {orders.map((order) => (
          <li key={order}>{order}</li>
        ))}
      </ul>
    </>
  );
}
