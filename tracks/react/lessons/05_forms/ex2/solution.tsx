// 05_forms / ex2 - checkboxes and selects.
// See tracks/react/lessons/05_forms/README.md, "Exercise 2".

export function Preferences() {
  return (
    <>
      <label htmlFor="theme">Theme</label>
      <select id="theme">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>

      <input id="emails" type="checkbox" />
      <label htmlFor="emails">Email me updates</label>

      <output>Theme: light, emails off</output>
    </>
  );
}
