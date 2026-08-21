// 05_forms / ex2 - reference solution.
import { useState } from "react";

export function Preferences() {
  const [theme, setTheme] = useState("light");
  const [emails, setEmails] = useState(false);

  return (
    <>
      <label htmlFor="theme">Theme</label>
      <select id="theme" value={theme} onChange={(event) => setTheme(event.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>

      <input
        id="emails"
        type="checkbox"
        checked={emails}
        onChange={(event) => setEmails(event.target.checked)}
      />
      <label htmlFor="emails">Email me updates</label>

      <output>
        Theme: {theme}, emails {emails ? "on" : "off"}
      </output>
    </>
  );
}
