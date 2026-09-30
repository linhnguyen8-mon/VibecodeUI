export type SkillGroup = "Product Logic" | "Information & Flow" | "Interaction & States" | "Cognitive UX" | "Visual Quality" | "System Quality" | "Trust & Accessibility";
export type SkillInput = { id: string; label: string; type: "text" | "textarea" | "select" | "multiselect"; placeholder?: string; required?: boolean; helperText?: string; options?: string[] };
export type SkillCriterion = { title: string; description: string; principle?: string };
export type Skill = {
  id: string; name: string; shortDescription: string; group: SkillGroup; scopes: string[]; stages: string[]; problems: string[];
  detects: string[]; whenToUse: string; inputs: SkillInput[]; principleIds: string[]; criteria: SkillCriterion[]; hardRules: string[];
  slopSignalIds: string[]; frameworkSourceIds: string[]; outputContract: string[]; promptTemplate: string;
};

const principlesBySkill: Record<string, string[]> = {
  "visual-hierarchy": ["traceability", "hierarchy-before-decoration"],
  "cardification-detector": ["traceability", "weakest-sufficient-separator"],
  "ai-visual-slop": ["traceability", "hierarchy-before-decoration"],
  "cognitive-load": ["traceability", "recognition-over-recall"],
  "state-coverage": ["traceability", "state-matched-feedback"],
  "error-recovery": ["traceability", "state-matched-feedback"],
};
const make = (id: string, name: string, shortDescription: string, group: SkillGroup, scopes: string[], problems: string[], detects: string[], whenToUse: string, criteria: string[], frameworkSourceIds: string[], stages = ["Structure", "Design", "QA"]): Skill => ({
  id, name, shortDescription, group, scopes, stages, problems, detects, whenToUse,
  inputs: skillInputs[id] ?? [
    { id: "target-surface", label: "Target screen or flow", type: "text", placeholder: "Name the screen, flow, or feature" },
    { id: "known-concern", label: "Known concern", type: "textarea", placeholder: "What should the review pay extra attention to?" },
  ], principleIds: principlesBySkill[id] ?? ["traceability", "recognition-over-recall"],
  criteria: criteria.map((title) => ({ title, description: `Check whether ${title.toLowerCase()} is clear, supported by evidence, and consistent across relevant states.` })),
  hardRules: ["Tie findings to observable evidence.", "Separate evidence from assumptions."], slopSignalIds: skillSlopSignals[id] ?? [], frameworkSourceIds,
  outputContract: ["Problem", "Evidence", "Severity (BLOCKER, HIGH, MEDIUM, LOW)", "Violated principle", "User impact", "Recommendation", "Expected impact", "Confidence (High, Medium, Low)", "Needs validation (yes/no)"],
  promptTemplate: "Inspect the current project for {{detects}}."
});

const skillInputs: Record<string, SkillInput[]> = {
  "purpose-validator": [
    { id: "product-goal", label: "Intended product outcome", type: "textarea", placeholder: "What should improve for users or the business?" },
    { id: "target-users", label: "Target users", type: "text", placeholder: "Who is this for?" },
  ],
  "context-specificity": [
    { id: "domain", label: "Product domain", type: "text", placeholder: "e.g. personal finance, learning" },
    { id: "target-users", label: "Target users", type: "textarea", placeholder: "Describe the people and situation" },
    { id: "product-voice", label: "Product voice or references", type: "textarea", placeholder: "Terms, examples, or references that establish context" },
  ],
  "information-architecture": [
    { id: "content-set", label: "Content or feature set", type: "textarea", placeholder: "What information needs to be organized?" },
    { id: "user-language", label: "User language", type: "text", placeholder: "Terms users already use" },
  ],
  "task-flow": [
    { id: "task", label: "Task", type: "text", placeholder: "What is the user trying to do?", required: true },
    { id: "starting-state", label: "Starting state", type: "text", placeholder: "Where does the task begin?" },
    { id: "expected-outcome", label: "Expected outcome", type: "text", placeholder: "What does successful completion look like?" },
    { id: "known-pain-point", label: "Known pain point", type: "textarea", placeholder: "Where do users get stuck today?" },
  ],
  "state-coverage": [
    { id: "feature", label: "Feature or component", type: "text", placeholder: "What interactive surface is being reviewed?" },
    { id: "async-events", label: "Async or failure events", type: "textarea", placeholder: "Loading, empty, network, permission, or validation cases" },
  ],
  "error-recovery": [
    { id: "failure-scenario", label: "Failure scenario", type: "textarea", placeholder: "What can fail, and what does the user need to recover?" },
    { id: "recovery-constraints", label: "Recovery constraints", type: "text", placeholder: "Data retention, retry limits, or support route" },
  ],
  "visual-hierarchy": [
    { id: "primary-task", label: "Primary task", type: "text", placeholder: "What is the main thing users need to do?" },
    { id: "primary-cta", label: "Primary action", type: "text", placeholder: "What action should be easiest to notice?" },
    { id: "primary-content", label: "Primary content", type: "textarea", placeholder: "What information should lead the screen?" },
    { id: "desired-emphasis", label: "Desired emphasis", type: "text", placeholder: "What deserves strongest visual weight?" },
  ],
  "design-system-compliance": [
    { id: "system-source", label: "Design system source", type: "text", placeholder: "Link, library, or short description" },
    { id: "token-source", label: "Token source", type: "text", placeholder: "Where should tokens come from?" },
    { id: "component-library", label: "Component library", type: "text", placeholder: "Library or package name" },
    { id: "known-exceptions", label: "Known exceptions", type: "textarea", placeholder: "Approved deviations and their reasons" },
  ],
  "responsive-layout": [
    { id: "target-viewports", label: "Target viewports", type: "text", placeholder: "e.g. 375px mobile, 1280px desktop" },
    { id: "layout-constraints", label: "Layout constraints", type: "textarea", placeholder: "Critical content, navigation, or interaction constraints" },
  ],
};

const skillSlopSignals: Record<string, string[]> = {
  "context-specificity": ["generic-copy", "generic-ui"],
  "visual-hierarchy": ["equal-prominence", "meaningless-decoration"],
  "cardification-detector": ["cardification", "excessive-pills", "excessive-badges"],
  "ai-visual-slop": ["generic-ui", "fake-dashboard", "meaningless-decoration", "generic-copy", "gradient-glow-overuse"],
  "design-system-compliance": ["arbitrary-tokens", "component-proliferation"],
};

export const skills: Skill[] = [
  make("purpose-validator", "Purpose Validator", "Check that the experience has a clear user and business purpose.", "Product Logic", ["Product", "Screen", "Flow"], ["Usability", "Trust"], ["unclear product purpose", "unjustified features", "misaligned goals"], "Use when validating a concept, feature, or existing product against its intended outcome.", ["User need is explicit", "Primary user goal is supported", "Business goal does not undermine user value"], ["ux-honeycomb", "jtbd"]),
  make("context-specificity", "Context Specificity", "Find generic decisions that ignore the product, domain, or users.", "Product Logic", ["Product", "Content", "Screen"], ["AI Slop", "Trust", "Consistency"], ["generic copy", "domain mismatch", "unsupported assumptions"], "Use when reviewing generated or early-stage interfaces that feel interchangeable.", ["Language reflects the domain", "Examples match target users", "Design choices have contextual reasons"], ["jtbd", "context-dimension"]),
  make("information-architecture", "Information Architecture", "Review labels, grouping, hierarchy, and findability.", "Information & Flow", ["Product", "Flow", "Screen", "Content"], ["Navigation", "Usability", "Complexity"], ["unclear grouping", "poor labels", "hidden information"], "Use when users struggle to find content or understand how information is organized.", ["Categories are mutually understandable", "Labels match user language", "Important information is easy to find"], ["nielsen-heuristics", "krug"]),
  make("task-flow", "Task Flow", "Trace important tasks from entry point to successful completion.", "Information & Flow", ["Flow", "Screen"], ["Usability", "Conversion", "Navigation"], ["unnecessary steps", "unclear next action", "broken task paths"], "Use when reviewing a critical journey, funnel, or repeated workflow.", ["Starting point is clear", "Steps support the intended outcome", "Completion is visible"], ["cognitive-walkthrough", "5es"]),
  make("state-coverage", "State Coverage", "Check that key interface states are represented and understandable.", "Interaction & States", ["Component", "Screen", "Flow", "Code"], ["Usability", "Consistency", "Trust"], ["missing loading state", "ambiguous empty state", "inconsistent status"], "Use before implementation or QA for interactive features and data-driven screens.", ["Loading, empty, success, and error states exist where needed", "State changes are communicated", "Actions match current state"], ["nielsen-heuristics", "norman-gulfs"], ["Build", "QA"]),
  make("error-recovery", "Error & Recovery", "Assess whether errors explain what happened and how to recover.", "Interaction & States", ["Component", "Flow", "Content", "Code"], ["Usability", "Trust", "Accessibility"], ["unhelpful errors", "lost user input", "no recovery path"], "Use for forms, payments, destructive actions, and failure-prone flows.", ["Errors identify the issue", "Recovery action is available", "User input is preserved where possible"], ["nielsen-heuristics", "norman-gulfs"], ["Design", "Build", "QA"]),
  make("cognitive-load", "Cognitive Load", "Spot avoidable effort, memory burden, and competing demands.", "Cognitive UX", ["Product", "Flow", "Screen", "Content"], ["Complexity", "Usability"], ["too many competing choices", "high memory burden", "dense instructions"], "Use when a screen or workflow feels difficult to process or learn.", ["Related choices are grouped", "Recognition is favored over recall", "Instructions arrive when needed"], ["cognitive-load", "laws-of-ux"]),
  make("visual-hierarchy", "Visual Hierarchy", "Check whether visual emphasis supports the primary task.", "Visual Quality", ["Screen", "Component"], ["Usability", "Conversion", "AI Slop"], ["equal prominence", "weak primary action", "competing emphasis"], "Use when users overlook the main content or action, or the screen feels visually noisy.", ["Primary task is visually apparent", "Related items share visual treatment", "Emphasis reflects importance"], ["gestalt", "nielsen-heuristics"]),
  make("cardification-detector", "Cardification Detector", "Find unnecessary cards and surface treatments that fragment content.", "Visual Quality", ["Screen", "Component"], ["AI Slop", "Complexity", "Consistency"], ["nested cards", "excessive containers", "fragmented related content"], "Use when a UI feels over-containerized or every item appears as a separate card.", ["Containers express meaningful grouping", "Related content stays visually connected", "Separators use the lightest sufficient treatment"], ["gestalt", "laws-of-ux"]),
  make("ai-visual-slop", "AI Visual Slop Detector", "Identify generic visual patterns without clear product rationale.", "Visual Quality", ["Screen", "Content", "Component"], ["AI Slop", "Trust", "Consistency"], ["decorative gradients", "meaningless badges", "generic copy", "fake metrics"], "Use when reviewing AI-generated or template-heavy visual work.", ["Decoration communicates meaning", "Metrics are supported by product context", "Copy is specific and credible"], ["gestalt", "context-dimension"]),
  make("design-system-compliance", "Design System Compliance", "Check consistency with the product's tokens and component patterns.", "System Quality", ["Component", "Screen", "Code"], ["Consistency", "Accessibility"], ["arbitrary tokens", "inconsistent components", "untracked exceptions"], "Use during implementation review, design QA, or when interface consistency drifts.", ["Existing components are reused appropriately", "Token use is consistent", "Exceptions have a clear reason"], ["design-system", "gestalt"], ["Design", "Build", "QA"]),
  make("accessibility-core", "Accessibility Core", "Review core interaction and content accessibility requirements.", "Trust & Accessibility", ["Product", "Screen", "Component", "Content", "Code"], ["Accessibility", "Usability", "Trust"], ["keyboard traps", "missing labels", "color-only meaning", "low contrast"], "Use throughout design and QA, especially for core user journeys.", ["Controls have accessible names", "Keyboard focus is visible and logical", "Meaning is not conveyed by color alone"], ["pour", "nielsen-heuristics"], ["Design", "Build", "QA"]),
  make("responsive-layout", "Responsive Layout", "Check that layouts adapt across viewport sizes without losing content or function.", "System Quality", ["Screen", "Component", "Code"], ["Usability", "Consistency", "Accessibility"], ["horizontal overflow", "collapsed navigation without an alternative", "unusable touch targets", "lost content at narrow widths"], "Use during responsive design review and before cross-device QA.", ["Content remains available at narrow and wide viewports", "Layout changes preserve task priority", "Controls remain usable with touch and keyboard", "No unintended horizontal overflow"], ["gestalt", "pour"], ["Design", "Build", "QA"]),
];
