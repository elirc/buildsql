// d12_fetching_states / ex2 - reference solution.
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInvoice(null);
    setError(null);
    load(invoiceId).then(setInvoice, (reason: unknown) => {
      setError(reason instanceof Error ? reason.message : String(reason));
    });
  }, [invoiceId, load]);

  if (error !== null) {
    return <p role="alert">{error}</p>;
  }
  if (invoice === null) {
    return <p role="status">Loading invoice {invoiceId}</p>;
  }
  return <p>Total: {invoice.total}</p>;
}
