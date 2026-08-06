/**
 * Teaches Loom's `Player` stand-in the two attribute APIs Vela's runtime path
 * uses, and seeds the one it reads.
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
 * Delete this once Loom's Instance stand-ins carry the attribute API — it is
 * the same kind of stopgap as the `_G` shim in src/lib/vela-loom-compat.ts.
 */

const COLOR_SCHEME_ATTRIBUTE = "VelaColorScheme";

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
