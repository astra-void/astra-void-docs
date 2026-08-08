/**
 * Teaches Loom's `Player` stand-in the two attribute APIs Vela's runtime path
 * uses, seeds the one it reads, and backfills the one `Enum` table Vela names
 * that Loom does not carry.
 *
 * Every Facet class string comes out of `fv()`, so it is a computed expression
 * and Vela resolves it at *runtime* rather than at compile time. That runtime
 * asks the environment which color scheme is active — for `dark:` variants —
 * through `Players.LocalPlayer.GetAttribute("VelaColorScheme")`, and subscribes
 * to `GetAttributeChangedSignal` for changes. Loom implements neither, so the
 * first Facet component to render dies with
 * `TypeError: player.GetAttribute is not a function`.
 *
 * Nothing here changes what a preview shows: Facet components name semantic
 * tokens, never `dark:`, so the attribute only has to exist and be honest. It
 * is seeded with the mode this build was lowered for, so a `dark:` class in a
 * scene of your own resolves the way it would in a real project built the same
 * way.
 *
 * The enum half is a different gap with the same shape. Vela lowers `self-end`
 * to a `UIFlexItem` carrying `ItemLineAlignment`, and Loom's `Enum` namespace is
 * the subset it needs — which does not include that one, so reading
 * `Enum.ItemLineAlignment.End` throws before anything renders. `dialog` is the
 * only registry component that reaches for it (the close ✕ is pushed right by
 * `self-end`), and a preview that crashes is worse than one that draws the ✕ in
 * the wrong place. **Loom does not lay the property out either**, so the glyph
 * sits where the list put it; where the ✕ actually lands is one of the things
 * only Studio can answer, and the Dialog page says so.
 *
 * Delete both once Loom's Instance stand-ins carry the attribute API and its
 * enum table carries `ItemLineAlignment` — they are the same kind of stopgap as
 * the `_G` shim in src/lib/vela-loom-compat.ts.
 */

const COLOR_SCHEME_ATTRIBUTE = "VelaColorScheme";

/** The names Vela's `resolveAlignSelfValue` can return. */
const ITEM_LINE_ALIGNMENTS = [
  "Automatic",
  "Start",
  "Center",
  "End",
  "Stretch",
] as const;

type EnumTable = Record<string, unknown>;

/**
 * Add `Enum.ItemLineAlignment` when the host does not have it, shaped like
 * Loom's own items: the layout engine and the encoder both key on `Name`.
 */
function installMissingEnums() {
  const enums = Enum as unknown as EnumTable;
  if (enums.ItemLineAlignment !== undefined) {
    return;
  }

  const table: EnumTable = {};
  ITEM_LINE_ALIGNMENTS.forEach((name, index) => {
    table[name] = {
      EnumType: "ItemLineAlignment",
      Name: name,
      Value: index,
      toString: () => `Enum.ItemLineAlignment.${name}`,
    };
  });

  enums.ItemLineAlignment = table;
}

type Connection = { Disconnect: () => void };
type Signal = { Connect: (callback: () => void) => Connection };

type Attributed = {
  GetAttribute?: (name: string) => unknown;
  SetAttribute?: (name: string, value: unknown) => void;
  GetAttributeChangedSignal?: (name: string) => Signal;
};

let installed = false;

export function installVelaEnvironment(mode: "light" | "dark") {
  if (installed) {
    return;
  }
  installed = true;

  installMissingEnums();

  const player = game.GetService("Players").LocalPlayer as unknown as Attributed;
  if (!player) {
    return;
  }

  const attributes = new Map<string, unknown>();
  const listeners = new Map<string, (() => void)[]>();

  attributes.set(COLOR_SCHEME_ATTRIBUTE, mode);

  // Only fill the gaps: a future Loom that implements these should win.
  if (player.GetAttribute === undefined) {
    player.GetAttribute = (name: string) => attributes.get(name);
  }

  if (player.SetAttribute === undefined) {
    player.SetAttribute = (name: string, value: unknown) => {
      attributes.set(name, value);
      for (const listener of listeners.get(name) ?? []) {
        listener();
      }
    };
  }

  if (player.GetAttributeChangedSignal === undefined) {
    player.GetAttributeChangedSignal = (name: string) => ({
      Connect: (callback: () => void) => {
        const existing = listeners.get(name) ?? [];
        existing.push(callback);
        listeners.set(name, existing);

        return {
          Disconnect: () => {
            listeners.set(
              name,
              (listeners.get(name) ?? []).filter((entry) => entry !== callback),
            );
          },
        };
      },
    });
  }
}
