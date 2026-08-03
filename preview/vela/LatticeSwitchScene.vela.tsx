import { React } from "@lattice-ui/react-runtime";
import { Switch } from "@lattice-ui/react-switch";
import { VelaStage } from "./VelaStage";

export function LatticeSwitch() {
  const [wifi, setWifi] = React.useState(true);
  const [bluetooth, setBluetooth] = React.useState(true);
  const [airplane, setAirplane] = React.useState(true);

  return (
    <frame className="flex flex-col gap-3 w-80 h-40 p-4 rounded-lg bg-slate-900 border border-slate-700">
      <frame className="flex flex-row items-center gap-4 w-72 h-8">
        <textlabel
          className="w-44 h-5 text-sm text-slate-100 text-left"
          LayoutOrder={1}
          Text="Wi-Fi"
        />
        <Switch.Root asChild checked={wifi} onCheckedChange={setWifi}>
          <textbutton
            className={`w-11 h-6 rounded-full ${wifi ? "bg-sky-500" : "bg-slate-700"}`}
            LayoutOrder={2}
            Text=""
          >
            <Switch.Thumb asChild>
              <frame className="w-5 h-5 rounded-full bg-white" />
            </Switch.Thumb>
          </textbutton>
        </Switch.Root>
      </frame>

      <frame className="flex flex-row items-center gap-4 w-72 h-8">
        <textlabel className="order-1 w-44 h-5 text-sm text-slate-100 text-left" Text="Bluetooth" />
        {bluetooth ? (
          <Switch.Root
            asChild
            checked
            className="order-2 w-11 h-6 rounded-full bg-sky-500"
            onCheckedChange={setBluetooth}
          >
            <textbutton Text="">
              <Switch.Thumb asChild>
                <frame className="w-5 h-5 rounded-full bg-white" />
              </Switch.Thumb>
            </textbutton>
          </Switch.Root>
        ) : (
          <Switch.Root
            asChild
            checked={false}
            className="order-2 w-11 h-6 rounded-full bg-slate-700"
            onCheckedChange={setBluetooth}
          >
            <textbutton Text="">
              <Switch.Thumb asChild>
                <frame className="w-5 h-5 rounded-full bg-white" />
              </Switch.Thumb>
            </textbutton>
          </Switch.Root>
        )}
      </frame>

      <frame className="flex flex-row items-center gap-4 w-72 h-8">
        <textlabel className="order-1 w-44 h-5 text-sm text-slate-100 text-left" Text="Airplane mode" />
        <Switch.Root
          checked={airplane}
          className={`w-11 h-6 rounded-full opacity-100 ${airplane ? "bg-sky-500" : "bg-slate-700"}`}
          LayoutOrder={2}
          onCheckedChange={setAirplane}
        >
          <Switch.Thumb asChild>
            <frame className="w-5 h-5 rounded-full bg-white" />
          </Switch.Thumb>
        </Switch.Root>
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <VelaStage height={160} width={320}>
      <LatticeSwitch />
    </VelaStage>
  ),
  title: "Lattice Switch",
} as const;
