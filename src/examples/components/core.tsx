import { React, useControllableState } from "@lattice-ui/core";

type ControllableToggleProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (next: boolean) => void;
};

function ControllableToggle(props: ControllableToggleProps) {
  const [checked, setChecked] = useControllableState({
    value: props.checked,
    defaultValue: props.defaultChecked ?? false,
    onChange: props.onCheckedChange,
  });

  return (
    <textbutton
      AutoButtonColor={false}
      BackgroundColor3={checked ? Color3.fromRGB(53, 104, 196) : Color3.fromRGB(34, 41, 54)}
      BorderSizePixel={0}
      Size={UDim2.fromOffset(220, 40)}
      Text={checked ? "Controlled on" : "Controlled off"}
      TextColor3={Color3.fromRGB(236, 240, 248)}
      TextSize={14}
      Event={{ Activated: () => setChecked((value) => !value) }}
    >
      <uicorner CornerRadius={new UDim(0, 8)} />
    </textbutton>
  );
}

export function CoreExample() {
  const [checked, setChecked] = React.useState(true);

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(260, 120)}>
      <ControllableToggle checked={checked} onCheckedChange={setChecked} />
      <textbutton
        AutoButtonColor={false}
        BackgroundColor3={Color3.fromRGB(60, 76, 104)}
        BorderSizePixel={0}
        Position={UDim2.fromOffset(0, 56)}
        Size={UDim2.fromOffset(220, 34)}
        Text="Set uncontrolled fallback"
        TextColor3={Color3.fromRGB(236, 240, 248)}
        TextSize={14}
        Event={{ Activated: () => setChecked(false) }}
      >
        <uicorner CornerRadius={new UDim(0, 8)} />
      </textbutton>
    </frame>
  );
}
