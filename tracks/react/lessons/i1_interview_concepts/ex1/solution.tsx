// i1_interview_concepts / ex1 - "this counter stops at 1. Why, and fix it."
// See tracks/react/lessons/i1_interview_concepts/README.md, "Exercise 1".
import { useEffect, useState } from "react";

export function StaleCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <output>{count}</output>;
}
