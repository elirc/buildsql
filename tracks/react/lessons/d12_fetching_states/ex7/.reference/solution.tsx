// d12_fetching_states / ex7 - reference solution.
import { useEffect, useState } from "react";

export type Customer = { id: string; name: string };

type Loaded = { name: string; orders: string[] };

export function CustomerOrders({
  customerId,
  fetchCustomer,
  fetchOrders,
}: {
  customerId: string;
  fetchCustomer: (customerId: string) => Promise<Customer>;
  fetchOrders: (customerId: string) => Promise<string[]>;
}) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoaded(null);
    setError(null);
    fetchCustomer(customerId)
      .then((customer) =>
        fetchOrders(customer.id).then((orders) => ({ name: customer.name, orders })),
      )
      .then(setLoaded, (reason: unknown) => {
        setError(reason instanceof Error ? reason.message : String(reason));
      });
  }, [customerId, fetchCustomer, fetchOrders]);

  if (error !== null) {
    return <p role="alert">{error}</p>;
  }
  if (loaded === null) {
    return <p role="status">Loading customer</p>;
  }

  return (
    <>
      <h2>{loaded.name}</h2>
      <ul>
        {loaded.orders.map((order) => (
          <li key={order}>{order}</li>
        ))}
      </ul>
    </>
  );
}
