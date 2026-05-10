import PlaceholderIcon from "../components/PlaceholderIcon";

const iconMap = {
  hammer: PlaceholderIcon,
  bolt: PlaceholderIcon,
  pipe: PlaceholderIcon,
  gear: PlaceholderIcon,
  shield: PlaceholderIcon,
  "hard-hat": PlaceholderIcon,
  "nut-bolt": PlaceholderIcon,
  sun: PlaceholderIcon,
  droplet: PlaceholderIcon,
};

export function mapCategoryIcon(iconKey) {
  if (typeof iconKey !== "string" || !iconKey.trim()) return PlaceholderIcon;
  const key = iconKey.trim().toLowerCase();
  return iconMap[key] || PlaceholderIcon;
}
