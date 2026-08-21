// i2_interview_drills / ex4 - reference solution.
import { useState } from "react";

export type Section = { id: string; title: string; body: string };

export function Accordion({ sections }: { sections: Section[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      {sections.map((section) => {
        const headerId = `${section.id}-header`;
        const panelId = `${section.id}-panel`;
        const open = openId === section.id;

        return (
          <div key={section.id}>
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : section.id)}
              >
                {section.title}
              </button>
            </h3>
            {open && (
              <div id={panelId} role="region" aria-labelledby={headerId}>
                {section.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
