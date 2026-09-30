import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  BookOpen,
  Boxes,
  CircleDot,
  Clipboard,
  ChevronLeft,
  ChevronRight,
  Download,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { loadMockLibraryData } from "./data/libraryData";
import { ComponentGallery } from "./ComponentGallery";
import { DesignSystemSidebar } from "./LayoutSidebar";
import { elevationCss, getElevation, getLayout } from "./lib/layout";
import type { AnimationPrompt, ButtonSize, ComponentPrompt, DesignSystem, PreviewCategory } from "./types";
import { getButtonSize } from "./lib/button";
import { tokenValue } from "./lib/tokens";
import { SkillWorkspace } from "./SkillWorkspace";
import { gradientPresetStyle } from "./lib/gradient";
import { getBadge } from "./lib/badge";
import { getSpacingAliases, getSpacingScale } from "./lib/spacing";
import {
  createAnimationPrompt,
  createDesignSystemPrompt,
  downloadPrompt,
  findResource,
  searchResources,
} from "./lib/library";

type View = "design-system" | "component" | "animation" | "principle";
type Toast = { tone: "success" | "error" | "info"; text: string } | null;

const data = loadMockLibraryData();

export function App() {
  const [view, setView] = useState<View>("design-system");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [selectedDsId, setSelectedDsId] = useState("ds-fintech-calm");
  const [selectedComponentId, setSelectedComponentId] = useState("component-primary-button");
  const [selectedAnimationId, setSelectedAnimationId] = useState("animation-dialog-enter");

  const counts = {
    "design-system": data.designSystems.length,
    animation: data.animations.length,
    principle: data.principles.length,
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="topbar">
          <div className="brand">
            <span className="brand-mark">+</span>
            <strong>Design system</strong>
            <span className="version-chip">v2.4.0</span>
          </div>
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={view === "principle" ? "Search skills..." : "Tìm kiếm design system, animation..."} />
          </label>
          <span className="avatar-chip">DS</span>
        </div>
        <nav className="nav-list" role="tablist" aria-label="Library sections">
          <NavButton active={view === "design-system"} count={counts["design-system"]} icon={<BookOpen />} onClick={() => setView("design-system")}>
            Design Systems
          </NavButton>
          <NavButton active={view === "animation"} count={counts.animation} icon={<CircleDot />} onClick={() => setView("animation")}>
            Animations
          </NavButton>
          <NavButton active={view === "principle"} count={counts.principle} icon={<SlidersHorizontal />} onClick={() => setView("principle")}>
            Design Principles
          </NavButton>
        </nav>
      </header>

      <main className="workspace">

        {view === "design-system" && (
          <DesignSystemsPage
            query={query}
            selectedId={selectedDsId}
            onSelect={setSelectedDsId}
            onToast={setToast}
          />
        )}
        {view === "component" && (
          <ComponentsPage
            query={query}
            selectedId={selectedComponentId}
            onSelect={setSelectedComponentId}
            onToast={setToast}
          />
        )}
        {view === "animation" && (
          <AnimationsPage
            query={query}
            selectedId={selectedAnimationId}
            onSelect={setSelectedAnimationId}
            onToast={setToast}
          />
        )}
        {view === "principle" && <SkillWorkspace query={query} onToast={setToast} />}
      </main>

      {toast && <div className={`toast ${toast.tone}`}>{toast.text}</div>}
    </div>
  );
}

function NavButton({
  active,
  children,
  count,
  disabled,
  icon,
  onClick,
}: {
  active?: boolean;
  children: string;
  count: number;
  disabled?: boolean;
  icon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button className={active ? "nav-button active" : "nav-button"} role="tab" aria-selected={active} tabIndex={active ? 0 : -1} disabled={disabled} onClick={onClick}>
      {icon}
      <span>{children}</span>
      <small>{count}</small>
    </button>
  );
}

function DesignSystemsPage({
  query,
  selectedId,
  onSelect,
  onToast,
}: {
  query: string;
  selectedId: string;
  onSelect: (id: string) => void;
  onToast: (toast: Toast) => void;
}) {
  const filtered = searchResources(data, query, ["design-system"]).filter((item): item is DesignSystem => item.type === "design-system");
  const seedDs = filtered.find((ds) => ds.id === selectedId) ?? filtered[0] ?? data.designSystems.find((ds) => ds.id === selectedId) ?? data.designSystems[0];
  const [drafts, setDrafts] = useState<Record<string, DesignSystem>>({});
  const [buttonSize, setButtonSize] = useState<ButtonSize>("M");
  const [previewCategory, setPreviewCategory] = useState<PreviewCategory>("foundation");
  const presetViewport = useRef<HTMLDivElement>(null);
  const [presetOverflow, setPresetOverflow] = useState(false);
  const [presetAtStart, setPresetAtStart] = useState(true);
  const [presetAtEnd, setPresetAtEnd] = useState(false);
  const workingDs = drafts[seedDs.id] ?? seedDs;
  const setWorkingDs = (next: DesignSystem) => setDrafts(previous => ({ ...previous, [next.id]: next }));
  useEffect(() => {
    const viewport = presetViewport.current;
    if (!viewport) return;
    const update = () => {
      setPresetOverflow(viewport.scrollWidth > viewport.clientWidth + 1);
      setPresetAtStart(viewport.scrollLeft <= 1);
      setPresetAtEnd(viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);
    viewport.addEventListener("scroll", update, { passive: true });
    return () => { observer.disconnect(); viewport.removeEventListener("scroll", update); };
  }, [filtered.map(ds => `${ds.id}:${ds.name}`).join("|")]);
  const scrollPresets = (direction: -1 | 1) => presetViewport.current?.scrollBy({ left: direction * 240, behavior: "smooth" });

  return (
    <section className="page-grid ds-grid">
      <div className="content-pane">
        <div className="ds-preset-carousel">
          {presetOverflow && <button className="ds-preset-scroll" type="button" aria-label="Cuộn preset sang trái" disabled={presetAtStart} onClick={() => scrollPresets(-1)}><ChevronLeft size={16} /></button>}
          <div className="ds-preset-viewport" ref={presetViewport}>
            <div className="ds-preset-list" role="group" aria-label="Design system presets">
              {filtered.map((ds) => (
                <button className="ds-preset" aria-pressed={ds.id === workingDs.id} key={ds.id} onClick={() => onSelect(ds.id)}>
                  <strong>{ds.name}</strong>
                  <span className="ds-preset-swatches" aria-hidden="true">
                    {ds.tokens.filter((token) => /^color\.brand\.(primary|secondary|tertiary)$/.test(token.name)).slice(0, 3).map((token) => (
                      <span key={token.name} style={{ background: token.value }} />
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {presetOverflow && <button className="ds-preset-scroll" type="button" aria-label="Cuộn preset sang phải" disabled={presetAtEnd} onClick={() => scrollPresets(1)}><ChevronRight size={16} /></button>}
        </div>
      </div>
      <aside className="color-output-pane">
        <DesignSystemSidebar key={workingDs.id} ds={workingDs} onChange={setWorkingDs} buttonSize={buttonSize} onButtonSizeChange={setButtonSize} previewCategory={previewCategory} />
        <PromptBox title="Generated AI Prompt" value={createDesignSystemPrompt(workingDs)} onToast={onToast} filename={`${workingDs.id}-prompt`} />
      </aside>
      <div className="preview-pane"><DesignSystemPreview ds={workingDs} buttonSize={buttonSize} onButtonSizeChange={setButtonSize} previewCategory={previewCategory} onPreviewCategoryChange={setPreviewCategory} /></div>
    </section>
  );
}


function DesignSystemPreview({ ds, buttonSize, onButtonSizeChange, previewCategory, onPreviewCategoryChange }: { ds: DesignSystem; buttonSize: ButtonSize; onButtonSizeChange: (size: ButtonSize) => void; previewCategory: PreviewCategory; onPreviewCategoryChange: (category: PreviewCategory) => void }) {
  const layout = getLayout(ds);
  const elevation = getElevation(ds);
  const button = getButtonSize(ds, buttonSize);
  const badge = getBadge(ds);
  const spacingScale = getSpacingScale(ds);
  const spacingAliases = getSpacingAliases(ds);
  const primary = tokenValue(ds, "color.brand.primary");
  const secondary = tokenValue(ds, "color.brand.secondary");
  const tertiary = tokenValue(ds, "color.brand.tertiary");
  const surface = tokenValue(ds, "color.surface.default");
  const soft = tokenValue(ds, "color.surface.soft");
  const text = tokenValue(ds, "color.text.primary");
  const border = tokenValue(ds, "color.border.default");
  const compact = ds.foundations.density === "compact";
  const statusSuccess = tokenValue(ds, "color.status.success");
  const backgroundMode = ds.foundations.background?.mode ?? (tokenValue(ds, "color.background.page") === "#FFFFFF" ? "light" : "soft");
  const gradientProfile = ds.foundations.background?.profiles?.gradient;
  const gradientPreset = gradientProfile?.gradientPreset ?? "linear";
  const auraStyle = gradientPresetStyle(gradientPreset, gradientProfile?.gradientStart ?? primary, gradientProfile?.gradientEnd ?? secondary, gradientProfile?.gradientAngle ?? ds.foundations.background?.gradientAngle ?? 135, "#F5F7FB");
  const isAura = backgroundMode === "gradient" && gradientPreset !== "linear";
  const pageBackground = backgroundMode === "gradient" && !isAura
    ? `linear-gradient(${ds.foundations.background?.gradientAngle ?? 135}deg, ${tokenValue(ds, "color.background.gradient-start", primary)}, ${tokenValue(ds, "color.background.gradient-end", secondary)})`
    : isAura ? "transparent" : tokenValue(ds, "color.background.page");

  return (
    <div
      className={`preview-board background-${backgroundMode} ${isAura ? `gradient-aura gradient-preset-${gradientPreset}` : ""} ${ds.foundations.contrastMode === "enhanced" ? "contrast-enhanced" : ""}`}
      style={{
        "--brand": primary,
        "--accent": secondary,
        "--brand-tertiary": tertiary,
        "--surface": surface,
        "--soft": soft,
        "--page": tokenValue(ds, "color.background.page"),
        ...auraStyle,
        "--page-background": pageBackground,
        "--gradient-start": tokenValue(ds, "color.background.gradient-start", primary),
        "--gradient-end": tokenValue(ds, "color.background.gradient-end", secondary),
        "--gradient-angle": `${ds.foundations.background?.gradientAngle ?? 135}deg`,
        "--surface-elevated": tokenValue(ds, "color.surface.elevated"),
        "--surface-tertiary": tokenValue(ds, "color.surface.tertiary"),
        "--text": text,
        "--content-text": text,
        "--text-secondary": tokenValue(ds, "color.text.secondary"),
        "--content-text-secondary": tokenValue(ds, "color.text.secondary"),
        "--text-disabled": tokenValue(ds, "color.text.disabled"),
        "--text-on-color": tokenValue(ds, "color.text.on-color"),
        "--text-link": tokenValue(ds, "color.text.link"),
        "--border": border,
        "--border-divider": tokenValue(ds, "color.border.divider", border),
        "--border-selected": tokenValue(ds, "color.border.selected", primary),
        "--border-disabled": tokenValue(ds, "color.border.disabled", border),
        "--border-hover": tokenValue(ds, "color.border.hover"),
        "--border-focus": tokenValue(ds, "color.border.focus"),
        "--border-width": `${ds.foundations.border?.enabled ? ds.foundations.border.width : 0}px`,
        "--interactive-hover": tokenValue(ds, "color.interactive.hover"),
        "--interactive-active": tokenValue(ds, "color.interactive.active"),
        "--interactive-focus": tokenValue(ds, "color.interactive.focus"),
        "--interactive-disabled": tokenValue(ds, "color.interactive.disabled"),
        "--focus-ring": tokenValue(ds, "color.focus.ring"),
        "--focus-ring-width": `${ds.foundations.focusRing?.width ?? 2}px`,
        "--overlay-scrim": tokenValue(ds, "color.overlay.scrim"),
        "--layout-section-gap": `${layout.sectionGap}px`,
        "--layout-component-gap": `${layout.componentGap}px`,
        "--layout-card-padding": `${layout.cardPadding}px`,
        "--layout-control-radius": `${layout.controlRadius}px`,
        "--layout-card-radius": `${layout.cardRadius}px`,
        "--elevation-0": elevationCss(elevation[0]),
        "--elevation-1": elevationCss(elevation[1]),
        "--elevation-2": elevationCss(elevation[2]),
        "--elevation-3": elevationCss(elevation[3]),
        "--elevation-4": elevationCss(elevation[4]),
        "--button-height": `${button.height}px`,
        "--button-font-size": `${button.fontSize}px`,
        "--button-font-weight": button.fontWeight,
        "--button-padding-x": `${button.paddingX}px`,
        "--button-padding-y": `${button.paddingY}px`,
        "--button-icon-padding-left": `${button.iconPaddingLeft}px`,
        "--button-icon-padding-right": `${button.iconPaddingRight}px`,
        "--button-icon-gap": `${button.iconGap}px`,
        "--button-icon-size": `${button.iconSize}px`,
        "--badge-height": `${badge.height}px`,
        "--badge-font-size": `${badge.fontSize}px`,
        "--badge-padding-x": `${badge.paddingX}px`,
        "--badge-radius": `${badge.radius}px`,
        "--font-family": ds.foundations.fontFamily,
        "--heading-size": `${ds.foundations.headingSize}px`,
        "--body-size": `${ds.foundations.bodySize}px`,
        "--content-width": ds.foundations.contentWidth,
        "--spacing-xs": `${spacingScale.XS}px`,
        "--spacing-s": `${spacingScale.S}px`,
        "--spacing-m": `${spacingScale.M}px`,
        "--spacing-l": `${spacingScale.L}px`,
        "--spacing-xl": `${spacingScale.XL}px`,
        "--spacing-1xl": `${spacingScale["1XL"]}px`,
        "--spacing-2xl": `${spacingScale["2XL"]}px`,
        "--spacing-3xl": `${spacingScale["3XL"]}px`,
        "--spacing-4xl": `${spacingScale["4XL"]}px`,
        "--spacing-5xl": `${spacingScale["5XL"]}px`,
        "--spacing-6xl": `${spacingScale["6XL"]}px`,
        "--spacing-page-margin": `${spacingScale[spacingAliases.pageMargin]}px`,
        "--spacing-container-padding": `${spacingScale[spacingAliases.containerPadding]}px`,
        "--spacing-section-gap": `${spacingScale[spacingAliases.sectionGap]}px`,
        "--spacing-component-gap": `${spacingScale[spacingAliases.componentGap]}px`,
        "--spacing-card-padding": `${spacingScale[spacingAliases.cardPadding]}px`,
        "--spacing-element-gap": `${spacingScale[spacingAliases.elementGap]}px`,
        "--radius-small": `${ds.foundations.radiusScale[0] ?? 4}px`,
        "--radius-control": `${ds.foundations.radiusScale[1] ?? layout.controlRadius}px`,
        "--radius-surface": `${ds.foundations.radiusScale[2] ?? layout.cardRadius}px`,
        "--radius-overlay": `${ds.foundations.radiusScale[3] ?? layout.cardRadius}px`,
        "--density": compact ? .72 : ds.foundations.density === "spacious" ? 1.28 : 1,
        "--pad": compact ? "12px" : ds.foundations.density === "spacious" ? "24px" : "18px",
        "--success": statusSuccess,
        "--warning": tokenValue(ds, "color.status.warning"),
        "--danger": tokenValue(ds, "color.status.danger"),
        "--info": tokenValue(ds, "color.status.info"),
      } as CSSProperties}
    >
      <ComponentGallery key={ds.id} ds={ds} buttonSize={buttonSize} onButtonSizeChange={onButtonSizeChange} previewCategory={previewCategory} onPreviewCategoryChange={onPreviewCategoryChange} />
    </div>
  );
}

function ComponentsPage({
  query,
  selectedId,
  onSelect,
  onToast,
}: {
  query: string;
  selectedId: string;
  onSelect: (id: string) => void;
  onToast: (toast: Toast) => void;
}) {
  const filtered = searchResources(data, query, ["component"]).filter((item): item is ComponentPrompt => item.type === "component");
  const selected = data.components.find((component) => component.id === selectedId) ?? data.components[0];
  const [prompt, setPrompt] = useState(selected.promptText);
  const [variant, setVariant] = useState(selected.previewConfig.defaultVariant);
  const [state, setState] = useState(selected.states[0]);

  if (!prompt.startsWith(selected.promptText.slice(0, 20))) {
    // Keep user edits while staying on the same resource.
  }

  return (
    <section className="page-grid component-grid">
      <div className="content-pane">
        <SectionHeader
          eyebrow="Module 2"
          title="Component Prompt Catalog"
          subtitle="Duyet component, xem demo, anatomy, variants/states va chinh prompt truc tiep."
        />
        <div className="resource-grid">
          {filtered.map((component) => (
            <button
              className={component.id === selected.id ? "resource-card selected" : "resource-card"}
              key={component.id}
              onClick={() => {
                onSelect(component.id);
                setPrompt(component.promptText);
                setVariant(component.previewConfig.defaultVariant);
                setState(component.states[0]);
              }}
            >
              <span>{component.category}</span>
              <strong>{component.name}</strong>
              <p>{component.description}</p>
              <small>{component.variants.length} variants / {component.states.length} states</small>
            </button>
          ))}
        </div>
      </div>

      <aside className="detail-pane">
        <PanelTitle icon={<Boxes />} title={selected.name} subtitle={selected.purpose} />
        <ComponentPreview component={selected} variant={variant} state={state} />
        <SelectorGroup label="Variant" options={selected.variants} value={variant} onChange={setVariant} />
        <SelectorGroup label="State" options={selected.states} value={state} onChange={setState} />
        <DetailList title="Anatomy" items={selected.anatomy} />
        <DetailList title="Related patterns" items={selected.relatedPatternIds.map((id) => resourceName(id))} />
        <PromptBox title="Editable component prompt" value={prompt} onChange={setPrompt} onToast={onToast} filename={`${selected.id}-prompt`} />
      </aside>
    </section>
  );
}

function ComponentPreview({ component, state, variant }: { component: ComponentPrompt; state: string; variant: string }) {
  const disabled = state === "disabled";
  const loading = state === "loading";
  return (
    <div className={`component-preview ${state}`}>
      <span className="preview-label">{component.name} / {variant} / {state}</span>
      {component.category === "forms" || component.id.includes("input") || component.id.includes("select") ? (
        <label className="mock-field">
          Label
          <input disabled={disabled} defaultValue={state === "error" ? "Needs review" : "Sample value"} />
          <small>{state === "error" ? "Please fix this field." : "Helper text keeps context visible."}</small>
        </label>
      ) : component.category === "overlay" ? (
        <div className="mock-dialog">
          <strong>Confirm task</strong>
          <p>Apply this component prompt to the selected interface?</p>
          <div><button disabled={disabled}>Cancel</button><button disabled={disabled}>Confirm</button></div>
        </div>
      ) : component.category === "navigation" ? (
        <div className="mock-tabs"><button className="active">Overview</button><button>Usage</button><button>States</button></div>
      ) : (
        <button className={variant.includes("destructive") ? "danger-button" : "big-button"} disabled={disabled}>
          {loading ? "Loading..." : component.name}
        </button>
      )}
    </div>
  );
}

function AnimationsPage({
  query,
  selectedId,
  onSelect,
  onToast,
}: {
  query: string;
  selectedId: string;
  onSelect: (id: string) => void;
  onToast: (toast: Toast) => void;
}) {
  const filtered = searchResources(data, query, ["animation"]).filter((item): item is AnimationPrompt => item.type === "animation");
  const seed = data.animations.find((animation) => animation.id === selectedId) ?? data.animations[0];
  const [working, setWorking] = useState<AnimationPrompt>(structuredClone(seed));
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    setWorking(structuredClone(seed));
  }, [seed]);

  return (
    <section className="animations-page">
      <SectionHeader
        eyebrow="Module 4"
        title="Animations & Motion Prompt Catalog"
        subtitle="Preview co replay, tinh chinh motion parameters va prompt luon ton trong prefers-reduced-motion."
      />
      <div className="motion-metrics">
        <span><strong>{data.animations.length}</strong> motion presets</span>
        <span><strong>120-320ms</strong> duration range</span>
        <span><strong>CSS / Framer</strong> engine hints</span>
      </div>
      <div className="animation-layout">
        <div className="animation-grid">
          {filtered.map((animation) => (
            <button className={animation.id === working.id ? "animation-card selected" : "animation-card"} key={animation.id} onClick={() => onSelect(animation.id)}>
              <span className="source-chip">{animation.intensity}</span>
              <strong>{animation.name}</strong>
              <p>{animation.description}</p>
              <MiniAnimation animation={animation} runId={0} />
            </button>
          ))}
        </div>
        <aside className="detail-pane">
          <PanelTitle icon={<Sparkles />} title={working.name} subtitle={`${working.targetElement} / ${working.purpose}`} />
          <div className="motion-stage">
            <MiniAnimation animation={working} runId={runId} large />
            <button className="primary-action" onClick={() => setRunId((value) => value + 1)}>
              <Play size={16} /> Replay
            </button>
          </div>
          <AnimationControls animation={working} onChange={setWorking} />
          <PromptBox title="Generated motion prompt" value={createAnimationPrompt(working)} onToast={onToast} filename={`${working.id}-prompt`} />
        </aside>
      </div>
    </section>
  );
}

function AnimationControls({ animation, onChange }: { animation: AnimationPrompt; onChange: (animation: AnimationPrompt) => void }) {
  const update = (patch: Partial<AnimationPrompt["previewParameters"]>) => {
    onChange({ ...animation, previewParameters: { ...animation.previewParameters, ...patch } });
  };

  return (
    <div className="control-card">
      <label>
        Duration: {animation.previewParameters.durationMs}ms
        <input type="range" min={80} max={520} step={20} value={animation.previewParameters.durationMs} onChange={(event) => update({ durationMs: Number(event.target.value) })} />
      </label>
      <label>
        Distance: {animation.previewParameters.distance}px
        <input type="range" min={0} max={80} step={2} value={animation.previewParameters.distance} onChange={(event) => update({ distance: Number(event.target.value) })} />
      </label>
      <label>
        Easing
        <select value={animation.previewParameters.easing} onChange={(event) => update({ easing: event.target.value })}>
          <option value="ease-out">ease-out</option>
          <option value="ease-in-out">ease-in-out</option>
          <option value="cubic-bezier(0.16, 1, 0.3, 1)">calm spring</option>
          <option value="linear">linear</option>
        </select>
      </label>
      <label>
        Direction
        <select value={animation.previewParameters.direction} onChange={(event) => update({ direction: event.target.value })}>
          <option value="scale-fade">scale-fade</option>
          <option value="slide-up">slide-up</option>
          <option value="up-fade">up-fade</option>
          <option value="lift">lift</option>
          <option value="vertical">vertical</option>
          <option value="scale">scale</option>
        </select>
      </label>
    </div>
  );
}

function MiniAnimation({ animation, large, runId }: { animation: AnimationPrompt; large?: boolean; runId: number }) {
  const style = {
    "--duration": `${animation.previewParameters.durationMs}ms`,
    "--distance": `${animation.previewParameters.distance}px`,
    "--easing": animation.previewParameters.easing,
  } as CSSProperties;
  return (
    <div className={large ? "mini-animation large" : "mini-animation"} style={style} key={`${animation.id}-${runId}-${animation.previewParameters.durationMs}-${animation.previewParameters.distance}`}>
      <div className={`motion-object ${animation.previewParameters.direction}`}>
        {animation.targetElement === "list" ? (
          <>
            <span>Item 01</span><span>Item 02</span><span>Item 03</span>
          </>
        ) : animation.targetElement === "toast" ? (
          <span>Saved prompt</span>
        ) : animation.targetElement === "button" ? (
          <button>Click thu nghiem</button>
        ) : animation.targetElement === "card" ? (
          <span>Micro card UI</span>
        ) : (
          <span>{animation.name}</span>
        )}
      </div>
    </div>
  );
}

function PromptBox({
  filename,
  onChange,
  onToast,
  title,
  value,
}: {
  filename: string;
  onChange?: (value: string) => void;
  onToast: (toast: Toast) => void;
  title: string;
  value: string;
}) {
  const copy = async () => {
    if (!value.trim()) return;
    try {
      await navigator.clipboard.writeText(value);
      onToast({ tone: "success", text: "Copied current prompt." });
    } catch {
      onToast({ tone: "error", text: "Copy failed. Clipboard permission is not available." });
    }
  };

  return (
    <div className="prompt-box">
      <div className="prompt-title"><Clipboard size={16} /> <strong>{title}</strong></div>
      <textarea value={value} onChange={(event) => onChange?.(event.target.value)} readOnly={!onChange} />
      <div className="prompt-actions">
        <button className="primary-action" disabled={!value.trim()} onClick={copy}><Clipboard size={16} /> Sao chep Prompt</button>
        <button disabled={!value.trim()} onClick={() => downloadPrompt(`${filename}.txt`, value)}><Download size={16} /> .txt</button>
        <button disabled={!value.trim()} onClick={() => downloadPrompt(`${filename}.md`, value, true)}><Download size={16} /> .md</button>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, subtitle, title }: { eyebrow: string; subtitle: string; title: string }) {
  return (
    <div className="section-header">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

function PanelTitle({ icon, subtitle, title }: { icon: ReactNode; subtitle: string; title: string }) {
  return (
    <div className="panel-title">
      {icon}
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

function SelectorGroup({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: string[]; value: string }) {
  return (
    <div className="selector-group">
      <strong>{label}</strong>
      <div>
        {options.map((option) => (
          <button className={option === value ? "active" : ""} key={option} onClick={() => onChange(option)}>{option}</button>
        ))}
      </div>
    </div>
  );
}

function DetailList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="detail-list">
      <strong>{title}</strong>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}


function resourceName(id: string) {
  const resource = findResource(data, id);
  if (!resource) return id;
  return resource.type === "principle" ? resource.title : resource.name;
}
