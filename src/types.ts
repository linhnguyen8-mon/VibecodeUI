export type ResourceType = "design-system" | "component" | "pattern" | "animation" | "principle";

export type SourceType = "original-sample" | "source-backed" | "library-synthesis";

export interface DesignToken {
  name: string;
  category: "color" | "spacing" | "radius" | "shadow" | "typography";
  value: string;
}

export interface ComponentLayout {
  sectionGap: number;
  componentGap: number;
  cardPadding: number;
  controlRadius: number;
  cardRadius: number;
}

export type SpacingTokenName = "XS" | "S" | "M" | "L" | "XL" | "1XL" | "2XL" | "3XL" | "4XL" | "5XL" | "6XL";

export interface SpacingAliases {
  pageMargin: SpacingTokenName;
  containerPadding: SpacingTokenName;
  sectionGap: SpacingTokenName;
  componentGap: SpacingTokenName;
  cardPadding: SpacingTokenName;
  elementGap: SpacingTokenName;
}

export interface ElevationLevel {
  x: number;
  y: number;
  blur: number;
  spread: number;
  opacity: number;
  color: string;
  zIndex?: number;
}

export type ButtonSize = "S" | "M" | "L";
export type GradientPreset = "linear" | "sunrise-drift" | "arctic-frost" | "eclipse-flare";
export type PreviewCategory = "foundation" | "component";

export interface ButtonSizeConfig {
  height: number;
  fontSize: number;
  fontWeight: number;
  paddingX: number;
  paddingY: number;
  iconPaddingLeft: number;
  iconPaddingRight: number;
  iconGap: number;
  iconSize: number;
  paddingXToken?: SpacingTokenName;
  paddingYToken?: SpacingTokenName;
  iconPaddingLeftToken?: SpacingTokenName;
  iconPaddingRightToken?: SpacingTokenName;
  iconGapToken?: SpacingTokenName;
}

export interface BadgeConfig {
  height: number;
  fontSize: number;
  paddingX: number;
  radius: number;
  paddingXToken?: SpacingTokenName;
}

export interface BackgroundPalette {
  page: string;
  surface: string;
  tertiary: string;
  soft: string;
  elevated: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  gradientPreset?: GradientPreset;
  surfaceLevels: 1 | 2;
}

export interface DesignSystem {
  id: string;
  type: "design-system";
  name: string;
  description: string;
  industryTags: string[];
  styleTags: string[];
  complexity: "simple" | "moderate" | "advanced";
  sourceType: SourceType;
  foundations: {
    fontFamily: string;
    headingSize: number;
    bodySize: number;
    contentWidth: string;
    spacingScale: number[];
    spacingAliases?: SpacingAliases;
    radiusScale: number[];
    density: "comfortable" | "compact" | "spacious";
    contrastMode?: "standard" | "enhanced";
    border?: {
      enabled: boolean;
      width: number;
    };
    focusRing?: {
      width: number;
    };
    background?: {
      mode: "light" | "soft" | "gradient";
      gradientAngle: number;
      profiles?: Record<"light" | "soft" | "gradient", BackgroundPalette>;
    };
    typography?: {
      ratio: number;
      roles: Record<"Display" | "H1" | "H2" | "H3" | "Body" | "Label" | "Caption", {
        size: number;
        lineHeight: number;
        weight: number;
      }>;
    };
    layout?: ComponentLayout;
    elevation?: ElevationLevel[];
    buttonSizes?: Record<ButtonSize, ButtonSizeConfig>;
    badge?: BadgeConfig;
  };
  tokens: DesignToken[];
  componentIds: string[];
  patternIds: string[];
  promptText: string;
  projectContext?: {
    product: string;
    domain: string;
    category: string;
    targetUsers: string;
    platforms: string[];
  };
  designPrinciples?: { goal: string; do: string[]; dont: string[] };
  domainRules?: { coreObjects: string[]; importantActions: string[]; specialComponents: string[]; businessRules: string[] };
}

export interface ComponentPrompt {
  id: string;
  type: "component";
  name: string;
  description: string;
  category: string;
  purpose: string;
  complexity: "basic" | "intermediate" | "advanced";
  tags: string[];
  frameworkTags: string[];
  anatomy: string[];
  variants: string[];
  states: string[];
  previewConfig: {
    interactive: boolean;
    defaultVariant: string;
  };
  relatedPatternIds: string[];
  promptText: string;
}

export interface AnimationPrompt {
  id: string;
  type: "animation";
  name: string;
  description: string;
  purpose: "feedback" | "transition" | "attention" | "loading" | "orientation";
  trigger: string[];
  targetElement: string;
  intensity: "subtle" | "standard" | "expressive";
  tags: string[];
  previewParameters: {
    durationMs: number;
    easing: string;
    direction: string;
    distance: number;
    staggerMs?: number;
    reducedMotionMode: string;
  };
  accessibilityNotes: string[];
  promptText: string;
}

export interface PatternPrompt {
  id: string;
  type: "pattern";
  name: string;
  description: string;
  tags: string[];
  componentIds: string[];
}

export interface DesignPrinciple {
  id: string;
  type: "principle";
  title: string;
  industry: string;
  explanation: string;
  tags: string[];
  evidenceType: SourceType;
}

export interface LibraryData {
  designSystems: DesignSystem[];
  components: ComponentPrompt[];
  patterns: PatternPrompt[];
  animations: AnimationPrompt[];
  principles: DesignPrinciple[];
}

export type LibraryResource =
  | DesignSystem
  | ComponentPrompt
  | PatternPrompt
  | AnimationPrompt
  | DesignPrinciple;
