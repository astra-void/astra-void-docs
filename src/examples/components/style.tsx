import { React } from "@lattice-ui/core";
import {
  createRecipe,
  defaultDarkTheme,
  mergeGuiProps,
  Text,
  ThemeProvider,
  useTheme,
} from "@lattice-ui/style";

type GuiProps = Record<string, unknown>;

const panelRecipe = createRecipe<GuiProps, {}>({
  base: (theme) => ({
    BackgroundColor3: theme.colors.surface,
    BorderSizePixel: 0,
  }),
});

function StyleDemo() {
  const { theme } = useTheme();

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(420, 220)}>
      <frame
        {...(mergeGuiProps(panelRecipe({}, theme), {
          Size: UDim2.fromOffset(320, 160),
        }) as Record<string, unknown>)}
      >
        <uicorner CornerRadius={new UDim(0, theme.radius.lg)} />
        <Text
          BackgroundTransparency={1}
          Position={UDim2.fromOffset(theme.space[12], theme.space[12])}
          Size={UDim2.fromOffset(280, 40)}
          Text="Style keeps tokens, recipes, and text primitives in one place."
          TextColor3={theme.colors.textPrimary}
          TextSize={theme.typography.bodyMd.textSize}
          TextWrapped={true}
          TextXAlignment={Enum.TextXAlignment.Left}
          TextYAlignment={Enum.TextYAlignment.Top}
        />
      </frame>
    </frame>
  );
}

export function StyleExample() {
  return (
    <ThemeProvider defaultTheme={defaultDarkTheme}>
      <StyleDemo />
    </ThemeProvider>
  );
}
