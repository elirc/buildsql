// i1_interview_concepts / ex1 - reference solution.
import { useEffect, useState } from "react";

export function StaleCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <output>{count}</output>;
}
