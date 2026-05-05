function PlaceholderIcon({ className = "" }) {
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.75 7.75h14.5M7.75 12h8.5M9.75 16.25h4.5"
      />
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.25" />
    </svg>
  );
}

export default PlaceholderIcon;
