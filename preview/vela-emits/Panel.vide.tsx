import Vide from "@rbxts/vide";

export function Panel(p: { big: () => boolean }) {
  return <frame className={() => (p.big() ? "m-4 p-2" : "p-2")} />;
}
