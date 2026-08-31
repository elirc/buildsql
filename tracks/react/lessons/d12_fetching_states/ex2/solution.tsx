// d12_fetching_states / ex2 - a request that fails still owes the user words.
// See tracks/react/lessons/d12_fetching_states/README.md, "Exercise 2".
import { useEffect, useState } from "react";

export type Invoice = { total: string };

export function InvoiceView({
  invoiceId,
  load,
}: {
  invoiceId: string;
  load: (invoiceId: string) => Promise<Invoice>;
}) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    load(invoiceId).then(setInvoice, () => setFailed(true));
  }, [invoiceId, load]);

  if (failed) {
    return <p>Something went wrong.</p>;
  }
  if (invoice === null) {
    return <p role="status">Loading invoice {invoiceId}</p>;
  }
  return <p>Total: {invoice.total}</p>;
}
