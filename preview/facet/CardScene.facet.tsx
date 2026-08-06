import React from "@rbxts/react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

export function ShopCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle Text="Trader's Pack" />
        <CardDescription Text="Everything you need for the first run — one purchase, no timers." />
      </CardHeader>
      <CardContent>
        <frame className="flex-row items-center gap-2 w-full h-fit">
          <Badge Text="Limited" />
          <Badge variant="outline" Text="2 left" />
        </frame>
        <Label Text="1,200 coins" />
      </CardContent>
      <CardFooter>
        <Button size="sm" Text="Buy" />
        <Button size="sm" variant="outline" Text="Cancel" />
      </CardFooter>
    </Card>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={236} mode={MODE} width={360}>
      <ShopCard />
    </FacetStage>
  ),
  title: "Card",
} as const;
