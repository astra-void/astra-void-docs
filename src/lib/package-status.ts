export type PackageStatus =
  | "stable-direction"
  | "experimental"
  | "feature-limited"
  | "internal-foundation"

export const PACKAGE_STATUS_LABELS: Record<PackageStatus, string> = {
  "stable-direction": "Stable direction",
  experimental: "Experimental",
  "feature-limited": "Feature limited",
  "internal-foundation": "Foundation",
}
