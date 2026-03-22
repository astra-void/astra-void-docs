import { React } from "@lattice-ui/core";
import { defaultDarkTheme, Text } from "@lattice-ui/style";
import { Row, Stack, Surface, SystemProvider, useSystemTheme } from "@lattice-ui/system";

function SystemDemo() {
  const { density, setDensity, theme } = useSystemTheme();

  return (
    <Surface tone="surface">
      <Stack gap={12} padding={16}>
        <Text
          BackgroundTransparency={1}
          Text={`System density: ${density}`}
          TextColor3={theme.colors.textPrimary}
          TextSize={theme.typography.bodyMd.textSize}
          TextXAlignment={Enum.TextXAlignment.Left}
        />
        <Row gap={8}>
          {(["compact", "comfortable", "spacious"] as const).map((nextDensity) => (
            <textbutton
              key={nextDensity}
              AutoButtonColor={false}
              BackgroundColor3={density === nextDensity ? theme.colors.accent : theme.colors.surfaceElevated}
              BorderSizePixel={0}
              Size={UDim2.fromOffset(108, 34)}
              Text={nextDensity}
              TextColor3={density === nextDensity ? theme.colors.accentContrast : theme.colors.textPrimary}
              TextSize={theme.typography.labelSm.textSize}
              Event={{ Activated: () => setDensity(nextDensity) }}
            >
              <uicorner CornerRadius={new UDim(0, theme.radius.md)} />
            </textbutton>
          ))}
        </Row>
      </Stack>
    </Surface>
  );
}

export function SystemExample() {
  return (
    <SystemProvider defaultDensity="comfortable" defaultTheme={defaultDarkTheme}>
      <SystemDemo />
    </SystemProvider>
  );
}
