/**
 * Distinct category / nav icons (SVG components). Falls back to a generic mark.
 */
function IconShell({ className = "", children }) {
  const classes = ["h-5 w-5", className].filter(Boolean).join(" ");
  return (
    <svg
      aria-hidden="true"
      className={classes}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {children}
    </svg>
  );
}

function HammerIcon(props) {
  return (
    <IconShell {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 5l4 4M14 6l-8.5 8.5a2.12 2.12 0 003 3L17 9"
      />
    </IconShell>
  );
}

function BoltIcon(props) {
  return (
    <IconShell {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"
      />
    </IconShell>
  );
}

function PipeIcon(props) {
  return (
    <IconShell {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10h16M4 14h16M7 10v4M17 10v4"
      />
    </IconShell>
  );
}

function GearIcon(props) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"
      />
    </IconShell>
  );
}

function ShieldIcon(props) {
  return (
    <IconShell {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z"
      />
    </IconShell>
  );
}

function HardHatIcon(props) {
  return (
    <IconShell {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 14h16M6 14a6 6 0 0112 0M9 8V6a3 3 0 016 0v2"
      />
    </IconShell>
  );
}

function NutBoltIcon(props) {
  return (
    <IconShell {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v18M8 7h8M8 17h8M9 10l3 2 3-2M9 14l3-2 3 2"
      />
    </IconShell>
  );
}

function SunIcon(props) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      />
    </IconShell>
  );
}

function DropletIcon(props) {
  return (
    <IconShell {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c3 4.5 6 7.5 6 11a6 6 0 11-12 0c0-3.5 3-6.5 6-11z"
      />
    </IconShell>
  );
}

function HomeIcon(props) {
  return (
    <IconShell {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
      />
    </IconShell>
  );
}

function GridIcon(props) {
  return (
    <IconShell {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"
      />
    </IconShell>
  );
}

function ChatIcon(props) {
  return (
    <IconShell {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      />
    </IconShell>
  );
}

function UserIcon(props) {
  return (
    <IconShell {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 21a8 8 0 00-16 0M12 11a4 4 0 100-8 4 4 0 000 8z"
      />
    </IconShell>
  );
}

function GenericIcon(props) {
  return (
    <IconShell {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.75 7.75h14.5M7.75 12h8.5M9.75 16.25h4.5"
      />
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.25" />
    </IconShell>
  );
}

const iconMap = {
  hammer: HammerIcon,
  bolt: BoltIcon,
  pipe: PipeIcon,
  gear: GearIcon,
  shield: ShieldIcon,
  "hard-hat": HardHatIcon,
  "nut-bolt": NutBoltIcon,
  sun: SunIcon,
  droplet: DropletIcon,
  home: HomeIcon,
  categories: GridIcon,
  grid: GridIcon,
  inquiry: ChatIcon,
  chat: ChatIcon,
  profile: UserIcon,
  user: UserIcon,
};

export function mapCategoryIcon(iconKey) {
  if (typeof iconKey !== "string" || !iconKey.trim()) return GenericIcon;
  const key = iconKey.trim().toLowerCase();
  return iconMap[key] || GenericIcon;
}

export {
  HammerIcon,
  BoltIcon,
  PipeIcon,
  GearIcon,
  ShieldIcon,
  HardHatIcon,
  NutBoltIcon,
  SunIcon,
  DropletIcon,
  HomeIcon,
  GridIcon,
  ChatIcon,
  UserIcon,
  GenericIcon,
};
