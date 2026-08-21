// i2_interview_drills / ex4 - "an accordion, and make it accessible."
// See tracks/react/lessons/i2_interview_drills/README.md, "Drill 4".
import { useState } from "react";

export type Section = { id: string; title: string; body: string };

export function Accordion({ sections }: { sections: Section[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      {sections.map((section) => (
        <div key={section.id}>
          <h3>
            <button type="button" onClick={() => setOpenId(section.id)}>
              {section.title}
            </button>
          </h3>
          <div>{section.body}</div>
        </div>
      ))}
    </div>
  );
}
