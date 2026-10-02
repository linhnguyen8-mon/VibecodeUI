import type { AnimationPrompt, DesignSystem, LibraryData, LibraryResource, ResourceType } from "../types";
import { buttonSizeOrder, getButtonSize } from "./button";
import { elevationCss, elevationLabels, getElevation, getLayout } from "./layout";
import { getTypography, typeRoles } from "./typography";
import { resolvedTokens } from "./tokens";
import { getBadge } from "./badge";
import { getSpacingAliases, getSpacingScale, spacingReference, spacingTokenNames } from "./spacing";

export function getAllResources(data: LibraryData): LibraryResource[] {
  return [
    ...data.designSystems,
    ...data.components,
    ...data.patterns,
    ...data.animations,
    ...data.principles,
  ];
}

export function resourceLabel(type: ResourceType): string {
  const labels: Record<ResourceType, string> = {
    "design-system": "Design System",
    component: "Component",
    pattern: "Pattern",
    animation: "Animation",
    principle: "Principle",
  };
  return labels[type];
}

export function searchResources(data: LibraryData, query: string, types: ResourceType[] = []): LibraryResource[] {
  const normalized = query.trim().toLowerCase();
  return getAllResources(data).filter((item) => {
    if (types.length > 0 && !types.includes(item.type)) {
      return false;
    }
    if (!normalized) {
      return true;
    }

    const fields = searchableFields(item).join(" ").toLowerCase();
    return fields.includes(normalized);
  });
}

export function findResource(data: LibraryData, id: string): LibraryResource | undefined {
  return getAllResources(data).find((item) => item.id === id);
}

export function createDesignSystemPrompt(ds: DesignSystem): string {
  const typography = getTypography(ds);
  const layout = getLayout(ds);
  const elevation = getElevation(ds);
  const badge = getBadge(ds);
  const spacingScale = getSpacingScale(ds);
  const spacingAliases = getSpacingAliases(ds);
  const allTokens = resolvedTokens(ds);
  const spacingNames = new Set(spacingTokenNames.map(name => `spacing.${name}`));
  const tokenLines = allTokens.filter(token => !spacingNames.has(token.name)).map((token) => `- ${token.name}: ${token.value}`).join("\n");
  const context = ds.projectContext ?? {
    product: ds.name,
    domain: ds.industryTags.join(" / "),
    category: ds.industryTags[0] ?? "General product",
    targetUsers: "Product users defined by the implementation project",
    platforms: ["Responsive web"],
  };
  const principles = ds.designPrinciples ?? {
    goal: ds.description,
    do: ["Reuse existing project components", "Keep interaction states accessible"],
    dont: ["Invent visual values outside the token system"],
  };
  const domain = ds.domainRules ?? {
    coreObjects: ["Define from product domain"],
    importantActions: ["Define from product workflows"],
    specialComponents: ["Compose from the shared component library"],
    businessRules: [ds.promptText],
  };
  const primitiveValues = [...new Set(allTokens.filter(token => token.category !== "spacing").map(token => token.value))];
  const primitiveLines = primitiveValues.map((value, index) => `- primitive.value.${String(index + 1).padStart(2, "0")}: ${value}`).join("\n");
  const spacingPrimitiveLines = spacingTokenNames.map(name => `- spacing.${name}: ${spacingScale[name]}px`).join("\n");
  const componentTokens = [
    "- button.md.height → control.height.md",
    "- button.primary.background → color.brand.primary",
    ...buttonSizeOrder.flatMap(size => {
      const button = getButtonSize(ds, size);
      const key = size.toLowerCase();
      return [
        `- button.${key}.padding-x → ${spacingReference(button.paddingXToken!)}`,
        `- button.${key}.padding-y → ${spacingReference(button.paddingYToken!)}`,
        `- button.${key}.icon-gap → ${spacingReference(button.iconGapToken!)}`,
      ];
    }),
    "- card.padding → spacing.card.padding",
    "- card.radius → radius.surface",
    "- badge.height → control.height.badge",
    "- badge.radius → radius.badge",
    `- badge.padding-x → ${spacingReference(badge.paddingXToken!)}`,
  ].join("\n");
  const isElevoLearning = ds.id === "ds-learning-bright";
  const previewSpecimens = isElevoLearning ? [
    "- Onboarding: splash, app-language picker, short benefit slides for voice practice/study materials/learner engagement, and sign-up entry.",
    "- Account access: email/password login, Google/Apple options, create-account form, inline invalid state, and forgot-password flow.",
    "- Learning home: greeting and language switcher, gems counter, current unit card, section progress, lesson roadmap with locked/current states, and bottom navigation.",
    "- Practice activities: reuse the shared progress/lives header and question shell across picture, listening, speaking, conversation, voice, video, puzzle, word-match, and picture-match variants.",
    "- Learning outcomes: show XP, correct-answer/result summary, streak calendar, gem rewards, and a clear Keep going action.",
    "- AI Learning Hub: AI Chat, AI Dictionary, and Conversation Practice entry cards; preserve message actions, composer placement, and speaking/listening states.",
    "- Translator, dictionary, video library/detail, and learner profile/settings templates as supporting screens.",
    "- Elevo component assets: raised cyan primary CTA with diagonal sheen and a 4px darker-blue lower shadow; white raised secondary/outline states; green correct and red incorrect feedback CTAs; input validation, answer-option states, tooltips, toggle, language selection, and resource counters.",
  ] : [
    "- Buttons: Primary, Secondary, Outline, Soft, Ghost, Success, Warning, Info; default, hover, active, focus-visible, disabled; leading, trailing and icon-only variants. Use the S/M/L size values above.",
    "- Badges: Default, Secondary, Outline, Success, Warning, Destructive.",
    "- Subscription form: name, email, payment fields with validation, color select, plan radio cards, notes, remember switch, consent checkboxes, cancel and submit.",
    "- Confirmation dialog with keyboard focus containment, Escape dismissal and focus restoration.",
    "- Balance and transaction cards; pill, icon, icon-only and underline navigation states.",
    "- Typography specimens and five elevation levels (flat through overlay).",
    "- Mobile templates: login, account home, settings, article and chat at an unscaled 375x816px frame with a shared top system status bar and bottom gesture control. Preview data is local demonstration data.",
  ];
  return [
    "# AI-READY DESIGN SYSTEM",
    "Single source of truth for design decisions, tokens, components, patterns, UX rules, and AI generation constraints.",
    "",
    "## 00. PROJECT CONTEXT",
    `- Product: ${context.product}`,
    `- Domain: ${context.domain}`,
    `- Category: ${context.category}`,
    `- Target users: ${context.targetUsers}`,
    `- Platforms: ${context.platforms.join(", ")}`,
    `Design system: ${ds.name}`,
    `Description: ${ds.description}`,
    `Industries: ${ds.industryTags.join(", ")}`,
    `Style tags: ${ds.styleTags.join(", ")}`,
    `Source label: ${ds.sourceType}`,
    "",
    "## 01. DESIGN PRINCIPLES",
    `- Goal: ${principles.goal}`,
    "- Do:",
    ...principles.do.map(item => `  - ${item}`),
    "- Don't:",
    ...principles.dont.map(item => `  - ${item}`),
    "",
    "## 01A. PLATFORM UX GUIDANCE",
    "- Use Apple's Human Interface Guidelines (HIG) as a supplemental reference for clear interaction, accessibility, feedback, and platform-native behavior: https://developer.apple.com/design/human-interface-guidelines/.",
    "- Apply HIG patterns when the target platform supports them; do not force iOS-specific controls or conventions onto responsive web or other platforms.",
    "- Treat this preset's current tokens, project requirements, and platform conventions as authoritative. HIG guidance must not override explicit product behavior or introduce unrepresented design values.",
    "",
    "## 02. FOUNDATION SYSTEM",
    "### Color system",
    "- Brand: primary, secondary, tertiary; neutral surfaces and content; functional success, warning, danger, and info.",
    "- Neutral source: color.neutral.base generates color.neutral.50–950. Map light page to neutral.50, soft/gradient page to neutral.100, surface.default/elevated to neutral.50, surface.tertiary to neutral.100, surface.soft to neutral.200, text.primary to neutral.950, text.secondary to neutral.600, text.disabled to neutral.400, border.divider to neutral.100, and borders to neutral.200–300. Components must consume these semantic tokens, never hardcode neutral colors.",
    "- Semantic tokens are the only color interface components may use. Include default, hover, active, disabled, focus, and on-color states where applicable.",
    "- Page/surface/elevated backgrounds; primary/secondary/disabled/on-color/link content; default/hover/active/focus/disabled interactive colors; default/divider/hover/focus/selected/disabled borders; focus ring and overlay scrim.",
    `- Page background mode: ${ds.foundations.background?.mode ?? "soft"}${ds.foundations.background?.mode === "gradient" ? `; preset ${ds.foundations.background.profiles?.gradient.gradientPreset ?? "linear"}${ds.foundations.background.profiles?.gradient.gradientPreset === "linear" ? ` at ${ds.foundations.background.gradientAngle}deg using color.background.gradient-start and color.background.gradient-end` : ` layered aura over ${ds.foundations.background.profiles?.gradient.page}`}` : ""}. Keep content surfaces visually separated from the page canvas with mode-appropriate contrast and elevation.`,
    "- Available gradient presets: Linear, Sunrise Drift, Arctic Frost, and Eclipse Flare. Aura presets use two decorative, blurred CSS gradient layers behind content, blend against the page canvas, ignore pointer events, and must not cover content. Eclipse Flare uses hard-light/soft-light over its dark base and switches to multiply on a light base.",
    "- Form layout wrappers are transparent and inherit background.page. The form container itself uses surface.default; nested controls use the configured secondary surfaces. On gradient pages, page-level labels use on-color content while labels inside the form use standard content tokens.",
    "- Background specimens must expose the hierarchy visually: page canvas → secondary surface 1 → two secondary surface 2 examples plus one elevated surface example. Each Light, Soft, and Gradient specimen reads only its own saved background profile.",
    "- Segmented controls and tab tracks use surface.default; their selected items use surface.tertiary. Forms and modal bodies use surface.default; inputs/selects use surface.tertiary, while textarea and option cards use surface.soft. If only one secondary surface is enabled, surface.soft aliases surface.tertiary.",
    "- Border usage: color.border.default for cards, inputs, selects, and default controls; color.border.divider for section, table-row, and list separators; color.border.selected for selected radio/checkbox, option cards, and selected items; color.border.hover for hoverable fields/cards/items; color.border.focus for keyboard-focused fields and controls; color.border.disabled for disabled inputs, buttons, and controls.",
    "- Navigation bar patterns: Pill with icon + text and icon-only variants; Normal with icon + text. Pill navigation uses a surface.default track with the active item on surface.tertiary; Normal navigation uses a transparent track and brand-colored active indicator. All items need accessible names and a clear selected state.",
    "- Mobile login fields use surface.default so they remain distinct from the mobile page canvas; desktop form field mappings continue to use the configured secondary surfaces.",
    "- Mobile chat uses surface.default for the header, assistant response bubbles, and message input. Suggestion buttons use surface.tertiary, remain keyboard focusable, and wrap within the mobile viewport.",
    "- Mobile settings groups user profile, account actions, and preferences into separate cards using surface.default; keep rows and dividers inside their parent card.",
    ...(ds.foundations.background?.profiles ? (["light", "soft", "gradient"] as const).map(mode => { const profile = ds.foundations.background!.profiles![mode]; return `- Background profile ${mode}: page ${profile.page}; surface ${profile.surface}; ${profile.surfaceLevels} secondary surface level${profile.surfaceLevels === 1 ? "" : "s"} (tertiary ${profile.tertiary}${profile.surfaceLevels === 2 ? `; soft ${profile.soft}` : "; soft aliases tertiary"}); elevated ${profile.elevated}${mode === "gradient" ? `; preset ${profile.gradientPreset ?? "linear"}${profile.gradientPreset === "linear" || !profile.gradientPreset ? `, ${profile.gradientStart} → ${profile.gradientEnd} at ${profile.gradientAngle}deg` : " aura layer settings from preset definition"}` : ""}.`; }) : []),
    "### Typography system",
    `- Font family: ${ds.foundations.fontFamily}; fallback: ui-sans-serif, system-ui, sans-serif.`,
    "- One font family across the system; use at most 3–4 text sizes per screen. Establish hierarchy with size, weight, line height, and spacing. Never invent hardcoded type values.",
    "- Scale:",
    ...typeRoles.map(role => { const style = typography.roles[role]; return `  - ${role}: ${style.size}px / ${style.lineHeight} line height / ${style.weight} weight`; }),
    "### Spacing system",
    "- Base unit: 4px. Primitive variables use named Figma-style tokens: XS, S, M, L, XL, 1XL–6XL.",
    `- Semantic mapping: page margin → ${spacingReference(spacingAliases.pageMargin)}; container padding → ${spacingReference(spacingAliases.containerPadding)}; section gap → ${spacingReference(spacingAliases.sectionGap)}; component gap → ${spacingReference(spacingAliases.componentGap)}; card padding → ${spacingReference(spacingAliases.cardPadding)}; element gap → ${spacingReference(spacingAliases.elementGap)}.`,
    "### Layout system",
    `- Container max width: ${ds.foundations.contentWidth}; responsive grid; density: ${ds.foundations.density}. Density controls spacing, card padding, and component size.`,
    "- Breakpoints: small ≤ 640px, medium 641–1024px, large > 1024px; adapt layouts without horizontal page overflow.",
    "### Radius system",
    `- Scale: ${ds.foundations.radiusScale.map(value => `${value}px`).join(", ")}. radius.control → small; radius.surface → medium; radius.overlay → large; also define none and pill.`,
    "- Nested radius rule: inner radius = max(0, outer radius − the gap between outer and inner elements). Use the actual enclosing gap token so nested corners stay visually parallel.",
    "### Elevation system",
    "- Levels L0–L4 map to z-index 0, 10, 20, 30, 40. Assign L1 to cards, L2 to floating elements, L3 to dropdowns/popovers, and L4 to modals/dialogs.",
    "- Resolved shadow values:",
    ...elevation.map((level, index) => `  - L${index} ${elevationLabels[index]}: ${elevationCss(level)}; z-index ${level.zIndex ?? index * 10}`),
    "",
    "## 03. TOKEN ARCHITECTURE",
    "### Layer 1 — Primitive tokens (raw values only)",
    spacingPrimitiveLines,
    primitiveLines,
    "### Layer 2 — Semantic tokens (meaning based)",
    tokenLines,
    `- control.height.md: ${getButtonSize(ds, "M").height}px`,
    `- radius.surface: ${layout.cardRadius}px`,
    `- control.height.badge: ${badge.height}px`,
    `- radius.badge: ${badge.radius}px`,
    "### Layer 3 — Component tokens",
    componentTokens,
    "- Resolution rule: Component → Semantic → Primitive. Never connect a component directly to a primitive.",
    "",
    "### Resolved foundations and component sizing",
    `- Font family: ${ds.foundations.fontFamily}`,
    `- Heading size: ${ds.foundations.headingSize}px`,
    `- Body size: ${ds.foundations.bodySize}px`,
    `- Typography ratio: ${typography.ratio.toFixed(3)}`,
    ...typeRoles.map(role => { const style = typography.roles[role]; return `- ${role}: ${style.size}px / ${style.lineHeight} / ${style.weight}`; }),
    `- Content width: ${ds.foundations.contentWidth}`,
    `- Density: ${ds.foundations.density}`,
    ...(isElevoLearning ? [
      "- Preset token source: use the Elevo AI Learning values resolved in this prompt as the source of truth; do not replace them with generic education defaults.",
      "- Figma-observed visual anchors: primary #59C8FF; stronger blue #1AB3FF; page #FAFAFA; surface #FFFFFF; pale blue #F5FCFF; heading #171A1C; body #5D686F; divider #E3E6E8.",
      "- Typography: Nunito for interface text; observed heading 32px, body 16px, and common labels 14px. Use the values resolved in this prompt when present.",
      "- Shape and spacing anchors: 375x812 mobile screens; 16px horizontal screen padding; 8/12/16/24px common spacing; 12px input radius, 16px primary-button radius, and 24px card radius.",
      "- Recreate the linked Figma assets as structural references. Keep their mobile hierarchy, blue raised-button treatment, lesson progress, language selection, and persistent bottom navigation; adapt content only where the requested product requires it.",
      "- Do not use amber primary actions, classroom dashboards, teacher profiles, or assignment submission flows: those are not part of the observed Elevo screens.",
    ] : []),
    `- Contrast mode: ${ds.foundations.contrastMode ?? "standard"}`,
    `- Border application: ${ds.foundations.border?.enabled ? "enabled" : "none"}`,
    `- Border width: ${ds.foundations.border?.enabled ? ds.foundations.border.width : 0}px`,
    `- Focus ring width: ${ds.foundations.focusRing?.width ?? 2}px`,
    `- Spacing scale: ${spacingTokenNames.map(name => `spacing.${name}`).join(", ")}`,
    `- Radius scale: ${ds.foundations.radiusScale.join(", ")}`,
    `- Page margin: ${spacingReference(spacingAliases.pageMargin)}`,
    `- Container padding: ${spacingReference(spacingAliases.containerPadding)}`,
    `- Section gap: ${spacingReference(spacingAliases.sectionGap)}`,
    `- Component gap: ${spacingReference(spacingAliases.componentGap)}`,
    `- Card padding: ${spacingReference(spacingAliases.cardPadding)}`,
    `- Element gap: ${spacingReference(spacingAliases.elementGap)}`,
    `- Control radius: ${layout.controlRadius}px`,
    `- Card radius: ${layout.cardRadius}px`,
    "- Elevation levels:",
    ...elevation.map((level, index) => `  - L${index} ${elevationLabels[index]}: ${elevationCss(level)}; z-index ${level.zIndex ?? index * 10}`),
    "- Button sizes:",
    ...buttonSizeOrder.map(size => { const button = getButtonSize(ds, size); return `  - ${size}: height ${button.height}px; font ${button.fontSize}px/${button.fontWeight}; padding ${spacingReference(button.paddingYToken!)} ${spacingReference(button.paddingXToken!)}; icon padding left/right ${spacingReference(button.iconPaddingLeftToken!)}/${spacingReference(button.iconPaddingRightToken!)}; icon gap ${spacingReference(button.iconGapToken!)}; icon size ${button.iconSize}px`; }),
    `- Badge: height ${badge.height}px; font ${badge.fontSize}px; horizontal padding ${spacingReference(badge.paddingXToken!)}; radius ${badge.radius}px`,
    "",
    "## 04. COMPONENT LIBRARY",
    "### Foundation",
    "- Button, Input, Select, Checkbox, Radio, Switch, Tooltip",
    "### Navigation",
    "- Navbar, Sidebar, Breadcrumb, Tabs, Pagination",
    "### Data display",
    "- Card, Table, List",
    "### Feedback",
    "- Toast, Alert, Modal, Dialog, Empty State, Error State, Loading State",
    "### Preview specimens",
    ...previewSpecimens,
    "- Keep wide state matrices and mobile templates in their own horizontal scroll regions on narrow viewports.",
    "",
    "## 05. DOMAIN DESIGN RULES",
    `- Domain: ${context.domain}`,
    `- Core objects: ${domain.coreObjects.join(", ")}`,
    `- Important actions: ${domain.importantActions.join(", ")}`,
    `- Special components: ${domain.specialComponents.join(", ")}`,
    "- Business rules:",
    ...domain.businessRules.map(rule => `  - ${rule}`),
    ...(ds.designAssets?.length ? [
      "",
      "## 06. PRESET DESIGN ASSETS",
      "Reusable screen templates and component patterns selected for this preset:",
      ...ds.designAssets.flatMap(asset => [
        `### ${asset.name} (${asset.type}; ${asset.priority} priority)`,
        `- Purpose: ${asset.purpose}`,
        `- Figma references: ${asset.figmaNodeIds.map(nodeId => `https://www.figma.com/design/IknnI7byXmy4Xqm7DXoKup/Elevo-AI-UI-Kit?node-id=${nodeId.replace(":", "-")}`).join(", ")}`,
        "- Composition:",
        ...asset.composition.map(item => `  - ${item}`),
        "- Responsive behavior:",
        ...asset.responsiveNotes.map(note => `  - ${note}`),
      ]),
      "- Compose screens from these assets and the shared component library; preserve their hierarchy and states. Do not invent a new template when an asset already fits the requested screen.",
    ] : []),
    "",
    "## GENERATION RULES",
    "### Always",
    "- When asked to build a product interface, implement the actual working user-facing screens in the existing project. A Design System editor, prompt customizer, preview, Figma reference, screenshot, or documentation is not a substitute for the requested interface.",
    "- Use the connected Figma capability to inspect provided source frames and assets directly when available; Figma references are implementation inputs, never the final deliverable. Access to Figma has been authorized for this project.",
    "- If Figma cannot be accessed in the current runtime, continue implementing from available references and project context; do not stop at linking Figma or ask the user to retrieve accessible details.",
    "- Inspect the existing project, tokens, components, and patterns before creating UI.",
    "- Use existing tokens; reuse components; follow patterns; preserve hierarchy; compose before creating.",
    "- Use named spacing variables for every margin, padding, and gap. Resolve Component → Semantic spacing → Primitive spacing; never hardcode a spacing number in a component.",
    "### Never",
    "- Create random colors, spacing, radius, shadows, or typography values.",
    "- Let components consume primitive tokens directly.",
    "- Create a new component or pattern when an existing one can be composed.",
    "- Ask before introducing a system extension that the current library cannot express.",
    "",
    "## DELIVERY REQUIREMENTS",
    "- Required outcome for an interface task: implement the requested user-facing UI and interactions in the existing codebase. Supporting design-system documentation may be included, but cannot replace the working interface.",
    "Generate this split folder structure:",
    "```text",
    "design-system/",
    "  principles.md",
    "  foundations/ (color.md, typography.md, spacing.md, layout.md, radius.md, elevation.md)",
    "  components/ (button.md, input.md, select.md, checkbox.md, radio.md, switch.md, tooltip.md, ...)",
    "  patterns/ (forms.md, data-table.md, ...)",
    "  domain/ (domain rules for this preset)",
    "  tokens/ (*.json)",
    "```",
    "",
    "## PRESET USAGE NOTES",
    ds.promptText,
  ].join("\n");
}

export function createAnimationPrompt(animation: AnimationPrompt): string {
  return [
    animation.promptText,
    "",
    "Motion parameters:",
    `- Trigger: ${animation.trigger.join(", ")}`,
    `- Target: ${animation.targetElement}`,
    `- Duration: ${animation.previewParameters.durationMs}ms`,
    `- Easing: ${animation.previewParameters.easing}`,
    `- Direction: ${animation.previewParameters.direction}`,
    `- Distance: ${animation.previewParameters.distance}px`,
    animation.previewParameters.staggerMs ? `- Stagger: ${animation.previewParameters.staggerMs}ms` : "",
    `- Reduced motion mode: ${animation.previewParameters.reducedMotionMode}`,
    "",
    "Accessibility:",
    "- Respect prefers-reduced-motion.",
    ...animation.accessibilityNotes.map((note) => `- ${note}`),
  ]
    .filter(Boolean)
    .join("\n");
}

export function downloadPrompt(filename: string, content: string, markdown = false) {
  const payload = markdown ? `# ${filename.replace(/\.(txt|md)$/i, "")}\n\n${content}` : content;
  const blob = new Blob([payload], { type: markdown ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function searchableFields(item: LibraryResource): string[] {
  switch (item.type) {
    case "design-system":
      return [item.name, item.description, ...item.industryTags, ...item.styleTags, item.complexity, item.sourceType];
    case "component":
      return [item.name, item.description, item.category, item.purpose, item.complexity, ...item.tags, ...item.frameworkTags];
    case "pattern":
      return [item.name, item.description, ...item.tags, ...item.componentIds];
    case "animation":
      return [
        item.name,
        item.description,
        item.purpose,
        item.targetElement,
        item.intensity,
        ...item.trigger,
        ...item.tags,
      ];
    case "principle":
      return [item.title, item.industry, item.explanation, ...item.tags, item.evidenceType];
  }
}
