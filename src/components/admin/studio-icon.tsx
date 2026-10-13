const paths: Record<string, string> = {
  dashboard: "M3 10l9-7 9 7v11h-6v-7H9v7H3z",
  identity: "M6 3h12l3 3v15H3V6z M8 9l4-3 4 3-4 7z",
  navigation: "M3 6h18M3 12h18M3 18h18M8 3v6M16 9v6M9 15v6",
  pages: "M6 2h8l5 5v15H6zM14 2v6h5M9 12h7M9 16h7",
  story: "M5 6a8 8 0 111 13M3 3v6h6M12 7v5l3 2",
  rooms: "M3 19V7m0 8h18v4M3 11h18v4M6 8h5v3",
  culinary: "M5 3v6l3 3v9M11 3v6l-3 3M17 3v18M17 3c5 5 5 9 0 9",
  culture: "M12 2l9 6v10l-9 4-9-4V8zM8 10l4-3 4 3v7H8z",
  foundation: "M3 8l9-6 9 6v13H3zM8 10l4 7 4-7",
  packages: "M3 7h7l2 3h9v11H3zM3 7V3h7l2 4",
  gallery: "M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5M7 7h1",
  location:
    "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1116 0zM9 10a3 3 0 106 0 3 3 0 10-6 0",
  terms: "M6 2h8l5 5v15H6zM14 2v6h5M9 12h7M9 16h7",
  media: "M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5M7 7h1",
  booking:
    "M12 3v3m0 12v3M3 12h3m12 0h3M6 6l2 2m8 8 2 2M6 18l2-2M16 8l2-2M8 12a4 4 0 108 0 4 4 0 10-8 0",
  revisions: "M4 5v5h5M5 8a8 8 0 117 12M12 7v5l3 2",
  diagnostics: "M3 12h4l3-9 4 18 3-9h4",
  search: "M10 3a7 7 0 110 14 7 7 0 010-14M15 15l6 6",
  chevron: "M9 5l7 7-7 7",
  external: "M14 3h7v7M21 3L10 14M10 3H3v18h18v-7",
  edit: "M3 21l2-7L17 2l5 5-12 12zM14 5l5 5",
  calendar: "M4 5h16v16H4zM4 10h16M8 2v6m8-6v6",
  check: "M5 12l5 5L20 7",
  layers: "M2 7l10-5 10 5-10 5zM2 12l10 5 10-5M2 17l10 5 10-5",
  desktop: "M2 3h20v14H2zM8 22h8m-4-5v5",
  mobile: "M7 2h10v20H7zM10 18h4",
  collapse: "M15 7l-5 5 5 5M5 5v14",
  menu: "M3 6h18M3 12h18M3 18h18",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM9 12a3 3 0 106 0 3 3 0 10-6 0",
  grip: "M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01",
};
export function StudioIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      className={"studio-icon " + className}
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name] || paths.pages} />
    </svg>
  );
}
export function StudioMark() {
  return (
    <span className="studio-mark" aria-hidden="true">
      <svg
        width="28"
        height="32"
        viewBox="0 0 28 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <path d="M14 2l7 5v8l-7 5-7-5V7zM7 7l7 5 7-5M14 12v18M3 14l11 7 11-7v9l-11 7-11-7z" />
      </svg>
    </span>
  );
}
