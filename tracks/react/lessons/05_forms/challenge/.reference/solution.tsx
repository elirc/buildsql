// 05_forms / challenge - reference solution.
import { useState } from "react";

type Errors = { street?: string; postcode?: string };

function validate(street: string, postcode: string): Errors {
  const errors: Errors = {};
  if (street.trim() === "") {
    errors.street = "Street is required";
  }
  if (!/^\d{4}$/.test(postcode)) {
    errors.postcode = "Postcode must be four digits";
  }
  return errors;
}

export function AddressForm({
  onSubmit,
}: {
  onSubmit: (address: { street: string; postcode: string }) => void;
}) {
  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(street, postcode);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit({ street, postcode });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="street">Street</label>
      <input
        id="street"
        value={street}
        onChange={(event) => setStreet(event.target.value)}
        aria-invalid={errors.street !== undefined}
        aria-describedby={errors.street ? "street-error" : undefined}
      />
      {errors.street && <span id="street-error">{errors.street}</span>}

      <label htmlFor="postcode">Postcode</label>
      <input
        id="postcode"
        value={postcode}
        onChange={(event) => setPostcode(event.target.value)}
        aria-invalid={errors.postcode !== undefined}
        aria-describedby={errors.postcode ? "postcode-error" : undefined}
      />
      {errors.postcode && <span id="postcode-error">{errors.postcode}</span>}

      <button type="submit">Save address</button>
    </form>
  );
}
