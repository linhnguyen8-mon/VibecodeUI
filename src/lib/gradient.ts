import type { CSSProperties } from "react";
import type { GradientPreset } from "../types";

export const gradientPresets: Array<{ id: GradientPreset; label: string; description: string }> = [
  { id: "linear", label: "Linear", description: "Gradient tuyến tính cơ bản" },
  { id: "sunrise-drift", label: "Sunrise Drift", description: "Aura ấm, nền sáng" },
  { id: "arctic-frost", label: "Arctic Frost", description: "Aura xanh lạnh, nền sáng" },
  { id: "eclipse-flare", label: "Eclipse Flare", description: "Aura tím trên nền tối" },
];

function isDark(hex: string): boolean {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return false;
  const channels = [1, 3, 5].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const luminance = channels.map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return luminance[0] * .2126 + luminance[1] * .7152 + luminance[2] * .0722 < .35;
}

export function gradientPresetStyle(preset: GradientPreset, start: string, end: string, angle: number, baseColor = "#FAF8F2"): CSSProperties {
  const common = {
    "--aura-blend-1": preset === "eclipse-flare" && isDark(baseColor) ? "hard-light" : "multiply",
    "--aura-blend-2": preset === "eclipse-flare" && isDark(baseColor) ? "soft-light" : "multiply",
    "--aura-blur-1": "108px",
    "--aura-blur-2": "180px",
    "--aura-opacity-1": "1",
  } as CSSProperties;
  if (preset === "sunrise-drift") return {
    ...common,
    "--aura-layer-1": "linear-gradient(rgba(0,0,0,0) 0%, rgba(0,138,255,.1) 30%, rgb(255,255,255) 20%, rgb(247,164,66) 70%, rgb(233,66,247) 100%)",
    "--aura-layer-2": "linear-gradient(rgba(0,0,0,0) 0%, rgba(0,138,255,.2) 35%, rgb(255,255,255) 70%, rgb(247,164,66) 80%, rgb(233,66,247) 100%)",
  } as CSSProperties;
  if (preset === "arctic-frost") return {
    ...common,
    "--aura-blur-1": "130px",
    "--aura-blur-2": "130px",
    "--aura-layer-1": "linear-gradient(rgba(0,0,0,0) 0%, rgba(200,230,255,.12) 28%, rgb(255,255,255) 18%, rgb(150,200,255) 68%, rgb(100,130,200) 100%)",
    "--aura-layer-2": "linear-gradient(rgba(0,0,0,0) 0%, rgba(200,230,255,.22) 34%, rgb(255,255,255) 66%, rgb(150,200,255) 82%, rgb(100,130,200) 100%)",
  } as CSSProperties;
  if (preset === "eclipse-flare") return {
    ...common,
    "--aura-blur-1": "180px",
    "--aura-blur-2": "260px",
    "--aura-opacity-1": ".5",
    "--aura-layer-1": "radial-gradient(ellipse 89% 99% at 50% -38%, rgba(0,0,0,0) 0%, rgb(30,32,35) 38%, rgb(45,70,115) 70%, rgb(142,123,227) 90%, rgb(248,104,196) 100%)",
    "--aura-layer-2": "radial-gradient(ellipse 95% 105% at 50% -34%, rgba(0,0,0,.15) 0%, rgb(30,32,35) 42%, rgb(55,82,135) 74%, rgb(150,126,228) 92%, rgb(246,108,198) 100%)",
  } as CSSProperties;
  return {
    ...common,
    "--aura-blend-1": "normal",
    "--aura-blend-2": "normal",
    "--aura-blur-1": "0px",
    "--aura-blur-2": "0px",
    "--aura-layer-1": `linear-gradient(${angle}deg, ${start}, ${end})`,
    "--aura-layer-2": "none",
  } as CSSProperties;
}

export function gradientBaseColor(preset: GradientPreset): string | undefined {
  if (preset === "eclipse-flare") return "#100E0B";
  if (preset === "sunrise-drift" || preset === "arctic-frost") return "#FAF8F2";
  return undefined;
}
