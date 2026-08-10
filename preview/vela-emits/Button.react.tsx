import React, { useState } from "@rbxts/react";

export function Button() {
  const [active] = useState(false);

  return (
    <textbutton
      className={active ? "bg-blue-600" : "bg-slate-700"}
      Text="Ready"
    />
  );
}
