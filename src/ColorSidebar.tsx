import { useEffect, useState } from "react";
import type { PointerEvent } from "react";
import { Check, Pipette } from "lucide-react";
import type { BackgroundPalette, DesignSystem, DesignToken, GradientPreset } from "./types";
import { brandShadeSteps, neutralScale, tokenValue } from "./lib/tokens";
import { gradientPresets } from "./lib/gradient";
import "./color-sidebar.css";

type ColorEntry = { label: string; token: string; fallback: string; detail?: string };

const HEX = /^#[0-9a-fA-F]{6}$/;

function hexToHsl(hex: string) {
  const [r, g, b] = [1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), lightness = (max + min) / 2;
  if (max === min) return { hue: 0, saturation: 0, lightness: Math.round(lightness * 100) };
  const delta = max - min;
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  hue = Math.round(hue * 60); if (hue < 0) hue += 360;
  return { hue, saturation: Math.round(saturation * 100), lightness: Math.round(lightness * 100) };
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100, l = lightness / 100, c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((hue / 60) % 2 - 1)), m = l - c / 2;
  const [r, g, b] = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
  return `#${[r, g, b].map(value => Math.round((value + m) * 255).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function ColorField({ entry, value, onChange, tokenOptions, resolveToken }: { entry: ColorEntry; value: string; onChange: (value: string) => void; tokenOptions?: string[]; resolveToken?: (token: string) => string }) {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [tokenMenuOpen, setTokenMenuOpen] = useState(false);
  const [hsl, setHsl] = useState(() => hexToHsl(HEX.test(value) ? value : entry.fallback));
  useEffect(() => setDraft(value), [value]);
  useEffect(() => { if (HEX.test(value)) setHsl(hexToHsl(value)); }, [value]);
  const commit = (next: string) => {
    setDraft(next);
    if (HEX.test(next)) onChange(next.toUpperCase());
  };
  const updateHsl = (next: Partial<typeof hsl>) => {
    const merged = { ...hsl, ...next }; setHsl(merged); onChange(hslToHex(merged.hue, merged.saturation, merged.lightness));
  };
  const pickPoint = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    updateHsl({ saturation: Math.round(Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * 100), lightness: Math.round((1 - Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))) * 100) });
  };
  const sampleColor = async () => {
    const picker = (window as Window & { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
    if (!picker) return;
    const result = await new picker().open(); commit(result.sRGBHex.toUpperCase());
  };
  const tokenGroups = (tokenOptions ?? []).reduce<Array<{ name: string; tokens: string[] }>>((groups, token) => {
    const [family, ...rest] = token.replace(/^color\./, "").split(".");
    const groupName = family === "brand" ? `Brand / ${rest[0]?.replace(/^./, letter => letter.toUpperCase()) ?? "Color"}` : family === "neutral" ? "Neutral" : family;
    const group = groups.find(item => item.name === groupName);
    if (group) group.tokens.push(token); else groups.push({ name: groupName, tokens: [token] });
    return groups;
  }, []);
  return <div className="color-token-row">
    <div className="color-token-name"><strong>{entry.label}</strong>{entry.detail && <small>{entry.detail}</small>}</div>
    <div className="color-token-input">
      {value.startsWith("ref:") ? <><span className="color-token-reference">{value.slice(4).replace("color.", "")}</span><button type="button" className="color-token-clear" aria-label={`Clear ${entry.label} token`} onClick={() => onChange(entry.fallback)}>×</button></> : <><button type="button" className="color-swatch-button" aria-label={`${entry.label} picker`} style={{ background: HEX.test(value) ? value : entry.fallback }} onClick={() => setOpen(current => !current)} /><input type="text" aria-label={`${entry.label} hex`} value={draft} maxLength={7} spellCheck={false} onChange={event => commit(event.target.value)} onBlur={() => { if (!HEX.test(draft)) setDraft(value); }} />{tokenOptions && <button type="button" className="color-token-source-arrow" aria-label={`Choose ${entry.label} token`} aria-expanded={tokenMenuOpen} onClick={() => setTokenMenuOpen(current => !current)}>⌄</button>}</>}
    </div>
    {tokenMenuOpen && tokenOptions && <div className="color-token-menu" role="listbox" aria-label={`${entry.label} color tokens`}>{tokenGroups.map(group => <section className="color-token-menu-group" key={group.name}><h4>{group.name}</h4>{group.tokens.map(token => { const selected = value === `ref:${token}`; const color = resolveToken?.(token) ?? entry.fallback; return <button type="button" role="option" aria-selected={selected} className="color-token-menu-option" key={token} onClick={() => { onChange(`ref:${token}`); setTokenMenuOpen(false); }}><span className="color-token-menu-swatch" style={{ background: color }} />{token.replace("color.", "")}{selected && <Check size={14} />}</button>; })}</section>)}</div>}
    {open && <div className="color-picker-popover" role="dialog" aria-label={`${entry.label} color picker`}>
      <div className="color-picker-head"><strong>{entry.label}</strong><button type="button" aria-label="Close color picker" onClick={() => setOpen(false)}><Check size={15} /></button></div>
      <div className="color-picker-square" onPointerDown={pickPoint} onPointerMove={event => { if (event.buttons) pickPoint(event); }} style={{ backgroundColor: `hsl(${hsl.hue} 100% 50%)` }}><span style={{ left: `${hsl.saturation}%`, top: `${100 - hsl.lightness}%` }} /></div>
      <label className="color-picker-slider hue-slider">Hue<input aria-label="Hue" type="range" min="0" max="359" value={hsl.hue} onInput={event => updateHsl({ hue: Number(event.currentTarget.value) })} onChange={event => updateHsl({ hue: Number(event.target.value) })} /></label>
      <label className="color-picker-slider alpha-slider">Opacity<input aria-label="Opacity" type="range" min="0" max="100" defaultValue="100" /></label>
      <div className="color-picker-tools"><button type="button" aria-label="Eyedropper" title="Eyedropper" onClick={sampleColor}><Pipette size={16} /></button><div className="color-picker-values"><input aria-label="Picker hex" value={draft} onChange={event => commit(event.target.value)} /><span>HEX</span></div><div className="color-picker-values"><input aria-label="Picker hue" type="number" min="0" max="359" value={hsl.hue} onChange={event => updateHsl({ hue: Number(event.target.value) })} /><span>H</span></div><div className="color-picker-values"><input aria-label="Picker saturation" type="number" min="0" max="100" value={hsl.saturation} onChange={event => updateHsl({ saturation: Number(event.target.value) })} /><span>S</span></div><div className="color-picker-values"><input aria-label="Picker lightness" type="number" min="0" max="100" value={hsl.lightness} onChange={event => updateHsl({ lightness: Number(event.target.value) })} /><span>L</span></div></div>
    </div>}
  </div>;
}

function ColorGroup({ title, entries, getValue, onChange, tokenOptions, getRawValue, resolveToken }: { title: string; entries: ColorEntry[]; getValue: (entry: ColorEntry) => string; onChange: (token: string, value: string) => void; tokenOptions?: string[] | ((entry: ColorEntry) => string[] | undefined); getRawValue?: (entry: ColorEntry) => string; resolveToken?: (token: string) => string }) {
  return <section className="color-group"><h3>{title}</h3>{entries.map(entry => <ColorField key={entry.token} entry={entry} value={getRawValue?.(entry) ?? getValue(entry)} tokenOptions={typeof tokenOptions === "function" ? tokenOptions(entry) : tokenOptions} resolveToken={resolveToken} onChange={value => onChange(entry.token, value)} />)}</section>;
}

export function ColorSidebar({ ds, onChange }: { ds: DesignSystem; onChange: (next: DesignSystem) => void }) {
  const read = (entry: ColorEntry) => tokenValue(ds, entry.token, entry.fallback);
  const primary = read({ label: "Primary", token: "color.brand.primary", fallback: "#2457C5" });
  const secondary = read({ label: "Secondary", token: "color.brand.secondary", fallback: "#0891B2" });
  const tertiary = read({ label: "Tertiary", token: "color.brand.tertiary", fallback: "#7C3AED" });
  const neutralTokenOptions = brandShadeSteps.map(step => `color.neutral.${step}`);
  const brandTokenOptions = ["primary", "secondary", ...(ds.tokens.some(token => token.name === "color.brand.tertiary") ? ["tertiary"] : [])].flatMap(brand => brandShadeSteps.map(step => `color.brand.${brand}.${step}`));
  const allColorTokenOptions = [...neutralTokenOptions, ...brandTokenOptions];
  const colorTokensFor = (entry: ColorEntry) => {
    if (entry.token.startsWith("color.brand.")) return undefined;
    if (entry.token.startsWith("color.text.")) return ["color.text.on-color", "color.text.link"].includes(entry.token) ? brandTokenOptions : neutralTokenOptions;
    if (entry.token.startsWith("color.border.")) return ["color.border.selected", "color.border.hover", "color.border.focus"].includes(entry.token) ? brandTokenOptions : neutralTokenOptions;
    if (entry.token.startsWith("color.status.")) return entry.token === "color.status.info" ? allColorTokenOptions : brandTokenOptions;
    if (entry.token === "color.overlay.scrim") return neutralTokenOptions;
    if (entry.token.startsWith("color.background.gradient-")) return allColorTokenOptions;
    return neutralTokenOptions;
  };
  const resolveColorToken = (token: string) => tokenValue(ds, token, "#FFFFFF");
  const raw = (token: string, fallback: string) => ds.tokens.find(item => item.name === token)?.value ?? fallback;
  const [brandCount, setBrandCount] = useState(ds.tokens.some(token => token.name === "color.brand.tertiary") ? 3 : 2);
  const surfaceSoft = read({ label: "Nền phụ 2", token: "color.surface.soft", fallback: "#F8FAFC" });
  const surface = read({ label: "Nền chính", token: "color.surface.default", fallback: "#FFFFFF" });
  const page = read({ label: "Nền trang", token: "color.background.page", fallback: surfaceSoft });
  const mode = ds.foundations.background?.mode ?? (page === "#FFFFFF" ? "light" : "soft");
  const background = ds.foundations.background ?? { mode, gradientAngle: 135 };
  const tokenPalette: BackgroundPalette = {
    page,
    surface,
    tertiary: read({ label: "Nền phụ 1", token: "color.surface.tertiary", fallback: "#FFFFFF" }),
    soft: surfaceSoft,
    elevated: read({ label: "Nền elevated", token: "color.surface.elevated", fallback: surface }),
    gradientStart: read({ label: "Gradient start", token: "color.background.gradient-start", fallback: primary }),
    gradientEnd: read({ label: "Gradient end", token: "color.background.gradient-end", fallback: secondary }),
    gradientAngle: background.gradientAngle,
    gradientPreset: "linear",
    surfaceLevels: 2,
  };
  const defaultProfiles: Record<"light" | "soft" | "gradient", BackgroundPalette> = {
    light: { page: "#FFFFFF", surface: "#FFFFFF", tertiary: "#F8FAFC", soft: "#F1F5F9", elevated: "#FFFFFF", gradientStart: primary, gradientEnd: secondary, gradientAngle: 135, surfaceLevels: 2 },
    soft: { page: "#F1F5F9", surface: "#FFFFFF", tertiary: "#FFFFFF", soft: "#F8FAFC", elevated: "#FFFFFF", gradientStart: primary, gradientEnd: secondary, gradientAngle: 135, surfaceLevels: 2 },
    gradient: { page: "#F1F5F9", surface: "#FFFFFF", tertiary: "#FFFFFF", soft: "#F8FAFC", elevated: "#FFFFFF", gradientStart: primary, gradientEnd: secondary, gradientAngle: 135, gradientPreset: "linear", surfaceLevels: 2 },
  };
  const storedPalette = background.profiles?.[mode];
  const activePalette: BackgroundPalette = { ...tokenPalette, ...storedPalette, gradientPreset: storedPalette?.gradientPreset ?? "linear", surfaceLevels: storedPalette?.surfaceLevels ?? 2 };
  const profiles = { ...defaultProfiles, ...background.profiles, [mode]: activePalette };
  const border = ds.foundations.border ?? { enabled: false, width: 1 };
  const focusRing = ds.foundations.focusRing ?? { width: 2 };

  const update = (changes: Array<[string, string]>) => {
    const values = new Map(changes);
    const tokens = ds.tokens.map(token => values.has(token.name) ? { ...token, value: values.get(token.name)! } : token);
    for (const [name, value] of values) {
      if (!tokens.some(token => token.name === name)) tokens.push({ name, value, category: "color" } as DesignToken);
    }
    onChange({ ...ds, tokens });
  };
  const updateNeutral = (seed: string) => {
    const shades = new Map(neutralScale(seed).map(({ step, value }) => [step, value]));
    const shade = (step: number) => shades.get(step) ?? seed;
    const neutralValues: Array<[string, string]> = [
      ["color.neutral.base", seed],
      ["color.text.primary", shade(950)], ["color.text.secondary", shade(600)], ["color.text.disabled", shade(400)],
      ["color.border.default", shade(300)], ["color.border.divider", shade(100)], ["color.border.disabled", shade(200)],
    ];
    const nextProfiles = {
      light: { ...profiles.light, page: shade(50), surface: shade(50), tertiary: shade(100), soft: shade(200), elevated: shade(50) },
      soft: { ...profiles.soft, page: shade(100), surface: shade(50), tertiary: shade(100), soft: shade(200), elevated: shade(50) },
      gradient: { ...profiles.gradient, page: shade(100), surface: shade(50), tertiary: shade(100), soft: shade(200), elevated: shade(50) },
    };
    const active = nextProfiles[mode];
    neutralValues.push(...paletteTokens(active));
    const values = new Map(neutralValues);
    const tokens = ds.tokens.map(token => values.has(token.name) ? { ...token, value: values.get(token.name)! } : token);
    for (const [name, value] of values) if (!tokens.some(token => token.name === name)) tokens.push({ name, value, category: "color" });
    onChange({ ...ds, tokens, foundations: { ...ds.foundations, background: { mode, gradientAngle: active.gradientAngle, profiles: nextProfiles } } });
  };
  const updatePrimary = (value: string) => {
    const changes: Array<[string, string]> = [["color.brand.primary", value]];
    changes.push(["color.focus.ring", "ref:color.brand.primary"]);
    if (read({ label: "Info", token: "color.status.info", fallback: primary }) === primary) changes.push(["color.status.info", value]);
    if (read({ label: "Viền selected", token: "color.border.selected", fallback: primary }) === primary) changes.push(["color.border.selected", value]);
    update(changes);
  };
  const updateOne = (token: string, value: string) => {
    if (token === "color.brand.primary") { updatePrimary(value); return; }
    update([[token, value]]);
  };
  const paletteTokens = (palette: BackgroundPalette): Array<[string, string]> => [
    ["color.background.page", palette.page], ["color.surface.default", palette.surface],
    ["color.surface.tertiary", palette.tertiary], ["color.surface.soft", palette.surfaceLevels === 1 ? palette.tertiary : palette.soft],
    ["color.surface.elevated", palette.elevated], ["color.background.gradient-start", palette.gradientStart],
    ["color.background.gradient-end", palette.gradientEnd],
  ];
  const updateBackground = (patch: Partial<BackgroundPalette>) => {
    const nextPalette = { ...activePalette, ...patch };
    const keyToToken: Partial<Record<keyof BackgroundPalette, string>> = {
      page: "color.background.page", surface: "color.surface.default", tertiary: "color.surface.tertiary",
      soft: "color.surface.soft", elevated: "color.surface.elevated", gradientStart: "color.background.gradient-start", gradientEnd: "color.background.gradient-end",
    };
    const values = new Map<string, string>();
    for (const key of Object.keys(patch) as Array<keyof BackgroundPalette>) {
      const token = keyToToken[key];
      const value = nextPalette[key];
      if (token && typeof value === "string") values.set(token, value);
    }
    const tokens = ds.tokens.map(token => values.has(token.name) ? { ...token, value: values.get(token.name)! } : token);
    for (const [name, value] of values) if (!tokens.some(token => token.name === name)) tokens.push({ name, value, category: "color" });
    const resolved = (value: string) => value.startsWith("ref:") ? tokenValue({ ...ds, tokens }, value.slice(4), "#FFFFFF") : value;
    const storedPalette = Object.fromEntries(Object.entries(nextPalette).map(([key, value]) => [key, typeof value === "string" ? resolved(value) : value])) as unknown as BackgroundPalette;
    onChange({ ...ds, tokens, foundations: { ...ds.foundations, background: { mode, gradientAngle: nextPalette.gradientAngle, profiles: { ...profiles, [mode]: storedPalette } } } });
  };
  const setBackgroundMode = (nextMode: "light" | "soft" | "gradient") => {
    const nextProfiles = { ...profiles, [mode]: activePalette };
    const nextPalette = nextProfiles[nextMode];
    onChange({ ...ds, foundations: { ...ds.foundations, background: { mode: nextMode, gradientAngle: nextPalette.gradientAngle, profiles: nextProfiles } } });
  };

  const changeBrandCount = (count: number) => {
    setBrandCount(count);
    if (count === 3) { update([["color.brand.tertiary", tertiary]]); return; }
    const remove = new Set(count === 1 ? ["color.brand.secondary", "color.brand.tertiary"] : ["color.brand.tertiary"]);
    onChange({ ...ds, tokens: ds.tokens.filter(token => !remove.has(token.name)) });
  };

  return <div className="color-sidebar" aria-label="Design system color editor">
    <section className="color-group">
      <div className="color-group-head"><h3>Màu thương hiệu</h3><div className="color-segment color-tabs" aria-label="Số lượng màu brand">{[1, 2, 3].map(count => <button type="button" key={count} aria-pressed={brandCount === count} onClick={() => changeBrandCount(count)}>{count} màu</button>)}</div></div>
      <ColorField entry={{ label: "Primary", token: "color.brand.primary", fallback: "#2457C5", detail: "CTA, link, focus, selected" }} value={primary} onChange={value => updateOne("color.brand.primary", value)} />
      {brandCount >= 2 && <ColorField entry={{ label: "Secondary", token: "color.brand.secondary", fallback: "#0891B2", detail: "Hành động phụ" }} value={secondary} onChange={value => updateOne("color.brand.secondary", value)} />}
      {brandCount >= 3 && <ColorField entry={{ label: "Tertiary", token: "color.brand.tertiary", fallback: "#7C3AED", detail: "Accent, illustration, highlight" }} value={tertiary} onChange={value => updateOne("color.brand.tertiary", value)} />}
      <ColorField entry={{ label: "Neutral", token: "color.neutral.base", fallback: "#64748B", detail: "Thang màu gốc (Hex) cho nền, chữ và divider" }} value={raw("color.neutral.base", "#64748B")} onChange={updateNeutral} />
    </section>

    <ColorGroup title="Màu chức năng" entries={[
      { label: "Success", token: "color.status.success", fallback: "#16A34A" },
      { label: "Warning", token: "color.status.warning", fallback: "#D97706" },
      { label: "Error / Danger", token: "color.status.danger", fallback: "#DC2626" },
      { label: "Info", token: "color.status.info", fallback: primary },
    ]} getValue={read} getRawValue={entry => raw(entry.token, read(entry))} onChange={updateOne} tokenOptions={colorTokensFor} resolveToken={resolveColorToken} />

    <section className="color-group">
      <div className="color-group-head"><h3>Màu nền</h3><div className="color-segment" aria-label="Surface mode"><button type="button" aria-pressed={mode === "light"} onClick={() => setBackgroundMode("light")}>Light</button><button type="button" aria-pressed={mode === "soft"} onClick={() => setBackgroundMode("soft")}>Soft</button><button type="button" aria-pressed={mode === "gradient"} onClick={() => setBackgroundMode("gradient")}>Gradient</button></div></div>
      {mode !== "gradient" && <ColorField entry={{ label: "Nền trang", token: "color.background.page", fallback: surfaceSoft, detail: `Canvas ${mode === "light" ? "Light" : "Soft"}` }} value={raw("color.background.page", activePalette.page)} tokenOptions={neutralTokenOptions} resolveToken={resolveColorToken} onChange={value => updateBackground({ page: value })} />}
      {mode === "gradient" && <>
        <label className="color-token-row"><span className="color-token-name"><strong>Gradient preset</strong><small>Một dải màu hoặc aura nhiều lớp</small></span><select aria-label="Gradient preset" value={activePalette.gradientPreset} onChange={event => { const preset = event.target.value as GradientPreset; updateBackground({ gradientPreset: preset }); }}>
          {gradientPresets.map(preset => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
        </select></label>
        {activePalette.gradientPreset === "linear" && <>
          <ColorField entry={{ label: "Gradient start", token: "color.background.gradient-start", fallback: primary }} value={raw("color.background.gradient-start", activePalette.gradientStart)} tokenOptions={allColorTokenOptions} resolveToken={resolveColorToken} onChange={value => updateBackground({ gradientStart: value })} />
          <ColorField entry={{ label: "Gradient end", token: "color.background.gradient-end", fallback: secondary }} value={raw("color.background.gradient-end", activePalette.gradientEnd)} tokenOptions={allColorTokenOptions} resolveToken={resolveColorToken} onChange={value => updateBackground({ gradientEnd: value })} />
          <label className="color-border-width"><span><strong>Góc gradient</strong><small>Hướng chuyển màu nền trang</small></span><span><input aria-label="Gradient angle" type="number" min="0" max="360" step="1" value={activePalette.gradientAngle} onChange={event => updateBackground({ gradientAngle: Math.max(0, Math.min(360, Number(event.target.value) || 0)) })} /><small>°</small></span></label>
        </>}
      </>}
      <ColorField entry={{ label: "Nền chính", token: "color.surface.default", fallback: "#FFFFFF" }} value={raw("color.surface.default", activePalette.surface)} tokenOptions={neutralTokenOptions} resolveToken={resolveColorToken} onChange={value => updateBackground({ surface: value })} />
      <div className="color-token-row"><div className="color-token-name"><strong>Số nền phụ</strong><small>Tối đa 2 · riêng cho {mode}</small></div><div className="color-segment" aria-label="Secondary surface count">{([1, 2] as const).map(level => <button type="button" key={level} aria-pressed={activePalette.surfaceLevels === level} onClick={() => updateBackground({ surfaceLevels: level })}>{level}</button>)}</div></div>
      <ColorField entry={{ label: "Nền phụ 1", token: "color.surface.tertiary", fallback: "#FFFFFF", detail: "Input, select, control và vùng nhập liệu" }} value={raw("color.surface.tertiary", activePalette.tertiary)} tokenOptions={neutralTokenOptions} resolveToken={resolveColorToken} onChange={value => updateBackground({ tertiary: value })} />
      {activePalette.surfaceLevels === 2 && <ColorField entry={{ label: "Nền phụ 2", token: "color.surface.soft", fallback: "#F8FAFC", detail: "Textarea, option card, tab và segmented control" }} value={raw("color.surface.soft", activePalette.soft)} tokenOptions={neutralTokenOptions} resolveToken={resolveColorToken} onChange={value => updateBackground({ soft: value })} />}
      <ColorField entry={{ label: "Nền elevated", token: "color.surface.elevated", fallback: surface, detail: "Dropdown, popover, modal" }} value={raw("color.surface.elevated", activePalette.elevated)} tokenOptions={neutralTokenOptions} resolveToken={resolveColorToken} onChange={value => updateBackground({ elevated: value })} />
    </section>

    <ColorGroup title="Màu nội dung" entries={[
      { label: "Chữ chính", token: "color.text.primary", fallback: "#0F172A" },
      { label: "Chữ phụ", token: "color.text.secondary", fallback: "#64748B" },
      { label: "Chữ disabled", token: "color.text.disabled", fallback: "#A3AEC0" },
      { label: "Chữ trên nền màu", token: "color.text.on-color", fallback: "#FFFFFF" },
      { label: "Link", token: "color.text.link", fallback: primary },
    ]} getValue={read} getRawValue={entry => raw(entry.token, read(entry))} onChange={updateOne} tokenOptions={colorTokensFor} resolveToken={resolveColorToken} />

    <section className="color-group">
      <div className="color-group-head"><h3>Border</h3><div className="color-segment color-border-mode" aria-label="Border application"><button type="button" aria-pressed={!border.enabled} onClick={() => onChange({ ...ds, foundations: { ...ds.foundations, border: { ...border, enabled: false } } })}>Không áp dụng</button><button type="button" aria-pressed={border.enabled} onClick={() => onChange({ ...ds, foundations: { ...ds.foundations, border: { ...border, enabled: true } } })}>Áp dụng</button></div></div>
      {border.enabled && <>
        <label className="color-border-width"><span><strong>Độ rộng viền</strong><small>Áp dụng cho component và surface</small></span><span><input aria-label="Border width" type="number" min="1" max="8" step="1" value={border.width} onChange={event => onChange({ ...ds, foundations: { ...ds.foundations, border: { enabled: true, width: Math.max(1, Math.min(8, Number(event.target.value) || 1)) } } })} /><small>px</small></span></label>
        <ColorGroup title="Màu viền" entries={[
          { label: "Viền chính", token: "color.border.default", fallback: "#E2E8F0", detail: "Card, input, select và control mặc định" },
          { label: "Viền phụ / divider", token: "color.border.divider", fallback: "#F1F5F9", detail: "Đường phân cách section, table row và list item" },
          { label: "Viền selected", token: "color.border.selected", fallback: primary, detail: "Radio/checkbox đã chọn, option card và item được chọn" },
          { label: "Viền hover", token: "color.border.hover", fallback: primary, detail: "Input, select, card và item khi rê chuột" },
          { label: "Viền focus", token: "color.border.focus", fallback: primary, detail: "Input, select và control nhận focus bằng bàn phím" },
          { label: "Viền disabled", token: "color.border.disabled", fallback: "#EEF1F6", detail: "Input, button và control bị vô hiệu hóa" },
        ]} getValue={read} getRawValue={entry => raw(entry.token, read(entry))} onChange={updateOne} tokenOptions={colorTokensFor} resolveToken={resolveColorToken} />
      </>}
    </section>

    <section className="color-group">
      <h3>Focus & Overlay</h3>
      <div className="color-token-row"><div className="color-token-name"><strong>Focus ring</strong><small>Themed from the primary button color</small></div><div className="color-derived-value"><span className="color-swatch-button" style={{ background: primary }} /><span>color.brand.primary</span></div></div>
      <label className="color-border-width"><span><strong>Độ rộng focus ring</strong><small>Button, input và switch</small></span><span><input aria-label="Focus ring width" type="number" min="1" max="12" step="1" value={focusRing.width} onChange={event => onChange({ ...ds, foundations: { ...ds.foundations, focusRing: { width: Math.max(1, Math.min(12, Number(event.target.value) || 1)) } } })} /><small>px</small></span></label>
      <ColorField entry={{ label: "Overlay scrim", token: "color.overlay.scrim", fallback: "#101828", detail: "Backdrop modal và dialog" }} value={raw("color.overlay.scrim", read({ label: "Overlay scrim", token: "color.overlay.scrim", fallback: "#101828" }))} tokenOptions={neutralTokenOptions} resolveToken={resolveColorToken} onChange={value => updateOne("color.overlay.scrim", value)} />
    </section>

  </div>;
}
