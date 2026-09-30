import { useEffect, useState } from "react";
import { Layers, LayoutGrid, Palette, Square, Tag, Type } from "lucide-react";
import type { BadgeConfig, ButtonSize, ButtonSizeConfig, ComponentLayout, DesignSystem, ElevationLevel, PreviewCategory, SpacingTokenName } from "./types";
import { ColorSidebar } from "./ColorSidebar";
import { TypographyEditor } from "./DesignEditor";
import { buttonSizeOrder, defaultButtonSizes, getButtonSize } from "./lib/button";
import { defaultLayout, elevationCss, elevationLabels, getElevation, getLayout } from "./lib/layout";
import { setToken } from "./lib/tokens";
import { defaultBadge, getBadge } from "./lib/badge";
import { defaultSpacingValues, getSpacingAliases, semanticSpacingColors, spacingTokenNames } from "./lib/spacing";
import "./layout-sidebar.css";

type Tab = "type" | "color" | "elevation" | "layout" | "button" | "badge";

function NumberControl({ label, value, min, max, unit = "px", onChange }: {
  label: string; value: number; min: number; max: number; unit?: string; onChange: (value: number) => void;
}) {
  return <label className="layout-number-control"><span>{label}</span><span className="layout-number-input"><input type="number" min={min} max={max} value={value} onChange={event => {
    const next = Number(event.target.value);
    if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)));
  }} /><small>{unit}</small></span></label>;
}

function SpacingControl({ ds, label, value, onChange }: { ds: DesignSystem; label: string; value: SpacingTokenName; onChange: (value: SpacingTokenName) => void }) {
  return <label className="layout-select-control spacing-token-control">{label}<select value={value} onChange={event => onChange(event.target.value as SpacingTokenName)}>{spacingTokenNames.map((name, index) => <option key={name} value={name}>{name} · {ds.foundations.spacingScale[index] ?? defaultSpacingValues[index]}px</option>)}</select></label>;
}

export function DesignSystemSidebar({ ds, onChange, buttonSize, onButtonSizeChange, previewCategory }: { ds: DesignSystem; onChange: (next: DesignSystem) => void; buttonSize: ButtonSize; onButtonSizeChange: (size: ButtonSize) => void; previewCategory: PreviewCategory }) {
  const [tab, setTab] = useState<Tab>("color");
  const [selectedLevel, setSelectedLevel] = useState(1);
  useEffect(() => { setTab(previewCategory === "foundation" ? "color" : "layout"); }, [previewCategory]);
  const layout = getLayout(ds);
  const elevations = getElevation(ds);
  const elevation = elevations[selectedLevel];
  const button = getButtonSize(ds, buttonSize);
  const badge = getBadge(ds);
  const spacingAliases = getSpacingAliases(ds);

  const updateFoundation = (changes: Partial<DesignSystem["foundations"]>) =>
    onChange({ ...ds, foundations: { ...ds.foundations, ...changes } });
  const updateLayout = (changes: Partial<ComponentLayout>) => {
    const nextLayout = { ...layout, ...changes };
    const radiusScale = [...ds.foundations.radiusScale];
    let tokens = ds.tokens;
    if (changes.controlRadius !== undefined && radiusScale[1] !== undefined) radiusScale[1] = changes.controlRadius;
    if (changes.cardRadius !== undefined) {
      if (radiusScale[2] !== undefined) radiusScale[2] = changes.cardRadius;
      tokens = setToken(tokens, "radius.card", `${changes.cardRadius}px`, "radius");
    }
    if (changes.cardPadding !== undefined) tokens = setToken(tokens, "spacing.card.padding", `${changes.cardPadding}px`, "spacing");
    onChange({ ...ds, tokens, foundations: { ...ds.foundations, radiusScale, layout: nextLayout } });
  };
  const updateElevation = (changes: Partial<ElevationLevel>) => {
    const next = elevations.map((level, index) => index === selectedLevel ? { ...level, ...changes } : level);
    updateFoundation({ elevation: next });
  };
  const updateButton = (changes: Partial<ButtonSizeConfig>) => {
    const buttonSizes = Object.fromEntries(buttonSizeOrder.map(size => [size, getButtonSize(ds, size)])) as Record<ButtonSize, ButtonSizeConfig>;
    buttonSizes[buttonSize] = { ...button, ...changes };
    updateFoundation({ buttonSizes });
  };
  const updateBadge = (changes: Partial<BadgeConfig>) => updateFoundation({ badge: { ...badge, ...changes } });
  const updateSpacingScale = (index: number, value: number) => {
    const normalized = Math.max(0, Math.round(value / 4) * 4);
    const spacingScale = spacingTokenNames.map((_, itemIndex) => itemIndex === index ? normalized : ds.foundations.spacingScale[itemIndex] ?? defaultSpacingValues[itemIndex]);
    onChange({ ...ds, foundations: { ...ds.foundations, spacingScale } });
  };
  const updateSpacingAlias = (name: keyof typeof spacingAliases, value: SpacingTokenName) =>
    updateFoundation({ spacingAliases: { ...spacingAliases, [name]: value } });
  const updateRadiusScale = (index: number, value: number) => {
    const radiusScale = ds.foundations.radiusScale.map((item, itemIndex) => itemIndex === index ? value : item);
    const nextLayout = { ...layout };
    let tokens = ds.tokens;
    if (index === 1) nextLayout.controlRadius = value;
    if (index === 2) {
      nextLayout.cardRadius = value;
      tokens = setToken(tokens, "radius.card", `${value}px`, "radius");
    }
    onChange({ ...ds, tokens, foundations: { ...ds.foundations, radiusScale, layout: nextLayout } });
  };

  return <div className="ds-sidebar-editor">
    <div className="ds-editor-tabs ds-editor-subtabs" role="tablist" aria-label={`${previewCategory} editor`}>
      {(previewCategory === "foundation"
        ? ([ ["color", Palette, "Color"], ["type", Type, "Typo"], ["elevation", Layers, "Elevation"] ] as const)
        : ([ ["layout", LayoutGrid, "Layout"], ["button", Square, "Button"], ["badge", Tag, "Badge"] ] as const)
      ).map(([id, Icon, label]) =>
        <button key={id} type="button" role="tab" id={`ds-tab-${id}`} aria-selected={tab === id} aria-controls={`ds-panel-${id}`} onClick={() => setTab(id)}><Icon size={15} />{label}</button>)}
    </div>
    {tab === "type" && <div id="ds-panel-type" role="tabpanel" aria-labelledby="ds-tab-type"><TypographyEditor ds={ds} onChange={onChange} /></div>}
    {tab === "color" && <div id="ds-panel-color" role="tabpanel" aria-labelledby="ds-tab-color"><ColorSidebar ds={ds} onChange={onChange} /></div>}
    {tab === "layout" && <div className="ds-editor-panel" id="ds-panel-layout" role="tabpanel" aria-labelledby="ds-tab-layout">
      <section className="layout-group"><h3>Kích thước giao diện</h3>
        <label className="layout-select-control">Density<select value={ds.foundations.density} onChange={event => updateFoundation({ density: event.target.value as DesignSystem["foundations"]["density"] })}>
          <option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="spacious">Spacious</option>
        </select></label>
        <label className="layout-select-control">Content width<select value={ds.foundations.contentWidth} onChange={event => updateFoundation({ contentWidth: event.target.value })}>
          {["56rem", "64rem", "68rem", "72rem", "80rem", "100%"].map(value => <option key={value}>{value}</option>)}
        </select></label>
      </section>
      <section className="layout-group"><h3>Component layout</h3>
        <NumberControl label="Bo góc control" value={layout.controlRadius} min={0} max={32} onChange={controlRadius => updateLayout({ controlRadius })} />
        <NumberControl label="Bo góc card" value={layout.cardRadius} min={0} max={40} onChange={cardRadius => updateLayout({ cardRadius })} />
        <button type="button" className="layout-reset" onClick={() => updateLayout({ ...defaultLayout })}>Đặt lại layout</button>
      </section>
      <section className="layout-group"><h3>Spacing primitives · Base 4px</h3>
        {spacingTokenNames.map((name, index) => <NumberControl key={name} label={name} value={ds.foundations.spacingScale[index] ?? defaultSpacingValues[index]} min={4} max={160} onChange={next => updateSpacingScale(index, next)} />)}
      </section>
      <section className="layout-group"><h3>Semantic spacing mapping</h3>
        {([
          ["pageMargin", "Page margin"], ["containerPadding", "Container padding"], ["sectionGap", "Section gap"],
          ["componentGap", "Component gap"], ["cardPadding", "Card padding"], ["elementGap", "Element gap"],
        ] as const).map(([name, label]) => <div className="semantic-spacing-control" key={name}><span className="semantic-spacing-marker" style={{ backgroundColor: semanticSpacingColors[name] }} /><SpacingControl ds={ds} label={label} value={spacingAliases[name]} onChange={value => updateSpacingAlias(name, value)} /></div>)}
      </section>
      <section className="layout-group"><h3>Radius scale</h3>
        {ds.foundations.radiusScale.map((value, index) => <NumberControl key={index} label={["Small", "Control", "Surface", "Overlay"][index] ?? `Radius ${index + 1}`} value={value} min={0} max={999} onChange={next => updateRadiusScale(index, next)} />)}
        <div className="layout-token-note">Control và Surface được nối trực tiếp với preview component.</div>
      </section>
    </div>}
    {tab === "elevation" && <div className="ds-editor-panel" id="ds-panel-elevation" role="tabpanel" aria-labelledby="ds-tab-elevation">
      <section className="layout-group"><h3>Elevation · 5 levels</h3>
        <div className="elevation-level-tabs" role="group" aria-label="Elevation level">{elevationLabels.map((label, index) => <button key={label} type="button" aria-pressed={selectedLevel === index} onClick={() => setSelectedLevel(index)}>L{index}</button>)}</div>
        <div className="elevation-editor-preview"><span style={{ boxShadow: elevationCss(elevation) }}>L{selectedLevel} · {elevationLabels[selectedLevel]}</span><code>{elevationCss(elevation)}</code></div>
        <div className="elevation-fields">
          <NumberControl label="X" value={elevation.x} min={-40} max={40} onChange={x => updateElevation({ x })} />
          <NumberControl label="Y" value={elevation.y} min={-40} max={60} onChange={y => updateElevation({ y })} />
          <NumberControl label="Blur" value={elevation.blur} min={0} max={100} onChange={blur => updateElevation({ blur })} />
          <NumberControl label="Spread" value={elevation.spread} min={-40} max={40} onChange={spread => updateElevation({ spread })} />
          <NumberControl label="Opacity" value={elevation.opacity} min={0} max={100} unit="%" onChange={opacity => updateElevation({ opacity })} />
          <NumberControl label="Z-index" value={elevation.zIndex ?? selectedLevel * 10} min={0} max={9999} unit="" onChange={zIndex => updateElevation({ zIndex })} />
          <label className="layout-color-control">Màu bóng<input type="color" value={elevation.color} onChange={event => updateElevation({ color: event.target.value })} /></label>
        </div>
      </section>
    </div>}
    {tab === "button" && <div className="ds-editor-panel" id="ds-panel-button" role="tabpanel" aria-labelledby="ds-tab-button">
      <section className="layout-group button-size-group"><div className="button-group-heading"><h3>Chọn size để chỉnh</h3><code>h {button.height}px</code></div>
        <div className="button-size-tabs" role="group" aria-label="Button size editor">{buttonSizeOrder.map(size => <button type="button" key={size} aria-pressed={buttonSize === size} onClick={() => onButtonSizeChange(size)}>{size}</button>)}</div>
      </section>
      <section className="layout-group"><h3>Chữ size {buttonSize}</h3>
        <NumberControl label="Font size" value={button.fontSize} min={8} max={32} onChange={fontSize => updateButton({ fontSize })} />
        <label className="layout-select-control button-weight-control">Font weight<select value={button.fontWeight} onChange={event => updateButton({ fontWeight: Number(event.target.value) })}>
          {[400, 500, 600, 700, 800].map(weight => <option key={weight} value={weight}>{weight}</option>)}
        </select></label>
      </section>
      <section className="layout-group"><h3>Nút thường</h3>
        <NumberControl label="Chiều cao nút" value={button.height} min={24} max={80} onChange={height => updateButton({ height })} />
        <SpacingControl ds={ds} label="Padding ngang" value={button.paddingXToken!} onChange={paddingXToken => updateButton({ paddingXToken })} />
        <SpacingControl ds={ds} label="Padding dọc" value={button.paddingYToken!} onChange={paddingYToken => updateButton({ paddingYToken })} />
      </section>
      <section className="layout-group"><h3>Nút có icon</h3>
        <SpacingControl ds={ds} label="Padding trái" value={button.iconPaddingLeftToken!} onChange={iconPaddingLeftToken => updateButton({ iconPaddingLeftToken })} />
        <SpacingControl ds={ds} label="Padding phải" value={button.iconPaddingRightToken!} onChange={iconPaddingRightToken => updateButton({ iconPaddingRightToken })} />
        <SpacingControl ds={ds} label="Spacing icon ↔ chữ" value={button.iconGapToken!} onChange={iconGapToken => updateButton({ iconGapToken })} />
        <NumberControl label="Icon size" value={button.iconSize} min={8} max={40} onChange={iconSize => updateButton({ iconSize })} />
        <button type="button" className="layout-reset" onClick={() => updateButton(defaultButtonSizes[buttonSize])}>Đặt lại size {buttonSize}</button>
      </section>
    </div>}
    {tab === "badge" && <div className="ds-editor-panel" id="ds-panel-badge" role="tabpanel" aria-labelledby="ds-tab-badge">
      <section className="layout-group button-size-group"><div className="button-group-heading"><h3>Badge</h3><code>{badge.height}px · r {badge.radius}px</code></div>
        <div className="badge-editor-preview"><span style={{ minHeight: badge.height, paddingInline: badge.paddingX, borderRadius: badge.radius, fontSize: badge.fontSize }}>Badge preview</span></div>
      </section>
      <section className="layout-group"><h3>Kích thước</h3>
        <NumberControl label="Chiều cao" value={badge.height} min={16} max={64} onChange={height => updateBadge({ height })} />
        <NumberControl label="Font size" value={badge.fontSize} min={8} max={24} onChange={fontSize => updateBadge({ fontSize })} />
        <SpacingControl ds={ds} label="Padding ngang" value={badge.paddingXToken!} onChange={paddingXToken => updateBadge({ paddingXToken })} />
      </section>
      <section className="layout-group"><h3>Bo góc</h3>
        <NumberControl label="Radius" value={badge.radius} min={0} max={999} onChange={radius => updateBadge({ radius })} />
        <button type="button" className="layout-reset" onClick={() => updateBadge(defaultBadge)}>Đặt lại Badge</button>
      </section>
    </div>}
  </div>;
}
