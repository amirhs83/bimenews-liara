// Display labels only; section keys and persisted names remain unchanged.
export function homeSectionLabel(key: string, fallback: string): string {
  switch (key) {
    case "energy":
      return "بازار بیمه";
    case "economy":
      return "بین‌الملل";
    case "gallery":
      return "گالری";
    default:
      return fallback;
  }
}
