import React from "@rbxts/react";

export function Panel(props: { big: boolean }) {
  return <frame className={props.big ? "m-4 p-2" : "p-2"} />;
}
