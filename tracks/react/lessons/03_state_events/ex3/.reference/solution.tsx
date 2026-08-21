// 03_state_events / ex3 - reference solution.
import { useState } from "react";

export function LikeButton() {
  const [liked, setLiked] = useState(false);

  return (
    <button type="button" aria-pressed={liked} onClick={() => setLiked((was) => !was)}>
      Like
    </button>
  );
}
