import React from "@rbxts/react";
import {
  TextField,
  TextFieldDescription,
  TextFieldInput,
  TextFieldLabel,
  TextFieldMessage,
} from "../ui/text-field";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * `invalid` is set on the root *and* on the input: the root's copy is what
 * carries the state into Lattice's context, the input's is what turns the
 * border `border-destructive`. Nothing inherits, so both are load-bearing.
 */
export function DisplayName() {
  return (
    <frame className="flex-col gap-4 w-full h-fit">
      <TextField defaultValue="Nimbus_Rider">
        <TextFieldLabel Text="Display name" />
        <TextFieldInput />
        <TextFieldDescription Text="Shown to other players in this server." />
      </TextField>
      <TextField invalid defaultValue="!!">
        <TextFieldLabel Text="Clan tag" />
        <TextFieldInput invalid />
        <TextFieldMessage Text="Letters and numbers only." />
      </TextField>
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={196} mode={MODE} width={320}>
      <DisplayName />
    </FacetStage>
  ),
  title: "Text field",
} as const;
