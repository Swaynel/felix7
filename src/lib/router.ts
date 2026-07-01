export const siteNav = [
  { href: "/music", label: "Music" },
  { href: "/tour", label: "Tour" },
  { href: "/shop", label: "Shop" },
  { href: "/epk", label: "EPK" },
  { href: "/press", label: "Press" },
  { href: "/contact", label: "Contact" },
] as const;

export type SiteNavItem = (typeof siteNav)[number];
