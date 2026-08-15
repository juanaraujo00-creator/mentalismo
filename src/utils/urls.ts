/**
 * Helper to ensure links shared with spectators don't ask for developer Google login.
 * In AI Studio, 'ais-dev-' is the private authenticated container,
 * while 'ais-pre-' is the public shared URL for spectators.
 */
export function getPublicAppUrl(suffix: string = ""): string {
  if (typeof window === "undefined") return "";

  let origin = window.location.origin;

  // If we are in the private dev environment, convert to the public preview URL
  if (origin.includes("ais-dev-")) {
    origin = origin.replace("ais-dev-", "ais-pre-");
  }

  const pathname = window.location.pathname;
  const cleanSuffix = suffix.startsWith("/") || suffix.startsWith("?") || suffix.startsWith("#")
    ? suffix
    : `/${suffix}`;

  return `${origin}${pathname}${cleanSuffix}`;
}
