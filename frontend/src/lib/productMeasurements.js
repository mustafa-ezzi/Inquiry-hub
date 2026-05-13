/** Firestore/API may send `{ value, unit, label }`, an array of those, or a string */
export function measurementTextToDisplay(input) {
  if (input == null || input === "") return "";
  if (typeof input === "string") return input.trim();
  if (typeof input === "number") return String(input);
  if (Array.isArray(input)) {
    return input
      .map(measurementTextToDisplay)
      .filter(Boolean)
      .join(", ");
  }
  if (typeof input === "object") {
    const { unit, label, value } = input;
    const v =
      value != null && value !== ""
        ? typeof value === "object"
          ? measurementTextToDisplay(value)
          : String(value).trim()
        : "";
    const u = unit != null && unit !== "" ? String(unit).trim() : "";
    const l = label != null && label !== "" ? String(label).trim() : "";
    return [v, u, l].filter(Boolean).join(" ").trim();
  }
  return "";
}
