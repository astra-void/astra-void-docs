export type LatticeProviderRequirement = {
  raw: string;
  packageName: string;
  providerName: string | null;
  optional: boolean;
};

export type LatticeRegistryPackage = {
  npm: string;
  peers: string[];
  providers: LatticeProviderRequirement[];
  notes: string[];
};

export type LatticeCliCommand = {
  signature: string;
  description: string;
  flags: string[];
  outputPhases: string[];
};

export type LatticeCliSnapshot = {
  packageName: string;
  version: string;
  binaries: string[];
  globalOptions: string[];
  commands: Record<string, LatticeCliCommand>;
  examples: string[];
};

export type LatticePackageSnapshot = {
  slug: string;
  npm: string;
  peers: string[];
  providers: LatticeProviderRequirement[];
  notes: string[];
  exports: string[];
  maturity: "stable" | "experimental";
  maturityNote: string;
};

export type LatticeWorkspaceRoadmapSection = {
  title: string;
  bullets: string[];
};

export type LatticeWorkspaceChangelogRelease = {
  version: string;
  date: string;
  summary: string[];
  migrationNotes: string[];
  sections: Record<string, string[]>;
};

export type LatticeWorkspaceSnapshot = {
  stability: {
    stableDirection: string[];
    experimental: Array<{
      slug: string;
      note: string;
    }>;
  };
  roadmap: LatticeWorkspaceRoadmapSection[];
  changelog: {
    unreleased: Record<string, string[]>;
    latestRelease: LatticeWorkspaceChangelogRelease | null;
  };
};

export type LatticeSnapshot = {
  sourceRepo: string;
  cli: LatticeCliSnapshot;
  registry: {
    packages: Record<string, LatticeRegistryPackage>;
    presets: Record<string, string[]>;
  };
  packages: Record<string, LatticePackageSnapshot>;
  workspace: LatticeWorkspaceSnapshot;
};
