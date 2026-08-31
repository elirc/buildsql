// d14_refs_dom / ex1 - focus on mount is not the same as focus on change.
// See tracks/react/lessons/d14_refs_dom/README.md, "Exercise 1".
import { useEffect, useId, useRef } from "react";

export function ReplyBox({ replyingTo }: { replyingTo: string }) {
  const id = useId();
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    box.current?.focus();
  }, []);

  return (
    <>
      <p>Replying to {replyingTo}</p>
      <label htmlFor={id}>Reply</label>
      <textarea id={id} ref={box} />
    </>
  );
}
