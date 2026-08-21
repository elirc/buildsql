// Shipped with the lesson - do not edit.
import { markLoaded, type Formatter } from "./registry";

markLoaded("json");

const format: Formatter = (rows) => JSON.stringify(rows);

export default format;
