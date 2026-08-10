import Vide, { source } from "@rbxts/vide";

export function Button() {
  const active = source(false);

  return (
    <textbutton
      className={() => (active() ? "bg-blue-600" : "bg-slate-700")}
      Text="Ready"
    />
  );
}
