// d14_refs_dom / ex1 - reference solution.
import { useEffect, useId, useRef } from "react";

export function ReplyBox({ replyingTo }: { replyingTo: string }) {
  const id = useId();
  const box = useRef<HTMLTextAreaElement>(null);

  // Not [] (only the first recipient gets the cursor) and not no array at all
  // (every render steals it back). The cursor moves when the recipient does.
  useEffect(() => {
    box.current?.focus();
  }, [replyingTo]);

  return (
    <>
      <p>Replying to {replyingTo}</p>
      <label htmlFor={id}>Reply</label>
      <textarea id={id} ref={box} />
    </>
  );
}
