import { componentDocs, type PackageDocData } from "./component-docs";
import latticeSnapshot from "./lattice-snapshot.generated";
import type {
  LatticePackageSnapshot,
  LatticeProviderRequirement,
} from "./lattice-snapshot-types";

export type ResolvedPackageDocData = PackageDocData &
  Pick<LatticePackageSnapshot, "slug" | "npm" | "exports" | "peers" | "providers" | "notes" | "maturity" | "maturityNote"> & {
    installName: string;
    maturityLabel: string;
  };

function resolveMaturityLabel(maturity: LatticePackageSnapshot["maturity"]) {
  return maturity === "experimental"
    ? "Experimental / feature-limited"
    : "Stable direction";
}

function resolveInstallName(slug: string) {
  return slug;
}

function validatePackageDoc(slug: string, snapshot: LatticePackageSnapshot | undefined) {
  if (!snapshot) {
    throw new Error(`Missing lattice snapshot metadata for package doc: ${slug}`);
  }

  return snapshot;
}

function sortProviders(providers: LatticeProviderRequirement[]) {
  return [...providers].sort((left, right) => left.raw.localeCompare(right.raw));
}

export const packageDocs: Record<string, ResolvedPackageDocData> = Object.fromEntries(
  Object.entries(componentDocs).map(([slug, doc]) => {
    const snapshot = validatePackageDoc(slug, latticeSnapshot.packages[slug]);

    return [
      slug,
      {
        ...doc,
        slug,
        installName: resolveInstallName(slug),
        npm: snapshot.npm,
        exports: snapshot.exports,
        peers: snapshot.peers,
        providers: sortProviders(snapshot.providers),
        notes: snapshot.notes,
        maturity: snapshot.maturity,
        maturityNote: snapshot.maturityNote,
        maturityLabel: resolveMaturityLabel(snapshot.maturity),
      },
    ];
  }),
) as Record<string, ResolvedPackageDocData>;
