import type { Skill } from "./skills";
import { frameworks, principles, slopSignals } from "./knowledge";
import type { ProjectContext } from "./projectContext";

export type FindingSeverity = "BLOCKER" | "HIGH" | "MEDIUM" | "LOW";
export type QualityState = "Pass" | "Warning" | "Fail" | "N/A";
export type Finding = {
  problem: string;
  evidence: string;
  severity: FindingSeverity;
  violatedPrinciple?: string;
  userImpact: string;
  recommendation: string;
  expectedImpact: string;
  confidence: "High" | "Medium" | "Low";
  needsValidation: boolean;
  qualityState?: QualityState;
};

export const FINDING_OUTPUT_CONTRACT = [
  "Problem", "Evidence", "Severity (BLOCKER, HIGH, MEDIUM, LOW)", "Violated principle", "User impact",
  "Recommendation", "Expected impact", "Confidence (High, Medium, Low)", "Needs validation (yes/no)",
] as const;

export function projectContextLines(context: ProjectContext): string[] {
  const entries: Array<[string, string | string[] | undefined]> = [
    ["Product", context.productName], ["Category", context.productCategory], ["Industry / domain", context.industryDomain],
    ["Target users", context.targetUsers], ["Primary user goal", context.primaryUserGoal], ["Primary business goal", context.primaryBusinessGoal],
    ["Platform", context.platform], ["User expertise", context.userExpertise], ["Design system", context.designSystem],
    ["Technical constraints", context.technicalConstraints], ["Additional context", context.additionalContext],
  ];
  const filled = entries.flatMap(([label, value]) => {
    if (Array.isArray(value)) return value.length ? [`- ${label}: ${value.join(", ")}`] : [];
    return value?.trim() ? [`- ${label}: ${value.trim()}`] : [];
  });
  return filled.length ? filled : ["No project context has been provided yet."];
}

export function buildAuditPrompt(skill: Skill, values: Record<string, string | string[]>, includedCriteria: Record<string, boolean>, projectContext: ProjectContext = {}): string {
  const skillContext = skill.inputs.flatMap((field) => {
    const value = values[field.id];
    const text = Array.isArray(value) ? value.join(", ") : value?.trim();
    return text ? [`- ${field.label}: ${text}`] : [];
  });
  const criteria = skill.criteria.filter((criterion) => includedCriteria[criterion.title] ?? true);
  const linkedPrinciples = skill.principleIds.map((id) => principles.find((item) => item.id === id)).filter((item) => item !== undefined);
  const linkedSignals = skill.slopSignalIds.map((id) => slopSignals.find((item) => item.id === id)).filter((item) => item !== undefined);
  const linkedFrameworks = skill.frameworkSourceIds.map((id) => frameworks.find((item) => item.id === id)).filter((item) => item !== undefined);
  const objective = skill.promptTemplate
    .replaceAll("{{skillName}}", skill.name)
    .replaceAll("{{detects}}", skill.detects.join(", "))
    .replaceAll("{{scope}}", skill.scopes.join(", "))
    .replaceAll("{{whenToUse}}", skill.whenToUse);

  return [
    `# UX QUALITY AUDIT — ${skill.name}`,
    "## ROLE", `Act as a senior product designer specializing in ${skill.name}.`,
    "## PROJECT CONTEXT", ...projectContextLines(projectContext),
    "## SKILL CONTEXT", ...(skillContext.length ? skillContext : ["No skill-specific context has been provided yet."]),
    "## OBJECTIVE", objective,
    `Review scope: ${skill.scopes.join(", ")}.`,
    `Look for: ${skill.detects.join(", ")}.`,
    "## DESIGN PRINCIPLES", ...(linkedPrinciples.length ? linkedPrinciples.map((item) => `- ${item.name}: ${item.statement} Rationale: ${item.rationale}`) : ["- No linked principles."]),
    "## AUDIT CRITERIA", ...(criteria.length ? criteria.map((item) => `- ${item.title}: ${item.description}`) : ["- No criteria selected. State that the audit has no enabled criteria and do not invent replacements."]),
    "## HARD RULES", ...(skill.hardRules.length ? skill.hardRules.map((rule) => `- ${rule}`) : ["- No additional hard rules." ]),
    "## AI SLOP SIGNALS", ...(linkedSignals.length ? linkedSignals.map((signal) => `- ${signal.name}: ${signal.description} Evidence pattern: ${signal.evidencePattern} Rationale: ${signal.rationale}`) : ["- No linked AI slop signals." ]),
    "## FRAMEWORK REFERENCES", ...(linkedFrameworks.length ? linkedFrameworks.map((framework) => `- ${framework.name}`) : ["- None" ]),
    "## INSPECTION INSTRUCTIONS",
    "- Inspect the actual implementation and cite concrete screens, components, states, or content.",
    "- Do not give generic UX advice or invent product requirements.",
    "- Identify evidence before recommending a change.",
    "- Distinguish direct evidence from assumptions and mark assumptions for validation.",
    "- Do not redesign before explaining the observed issue.",
    "## OUTPUT CONTRACT",
    "Return one finding per issue using these fields:",
    ...(skill.outputContract.length ? skill.outputContract : FINDING_OUTPUT_CONTRACT).map((field) => `- ${field}`),
    "Use quality state Pass, Warning, Fail, or N/A only when reporting a criterion status. Do not produce a numeric overall score.",
  ].join("\n");
}

export function buildCriteriaOnly(skill: Skill, includedCriteria: Record<string, boolean>): string {
  const criteria = skill.criteria.filter((criterion) => includedCriteria[criterion.title] ?? true);
  return [`# ${skill.name} — Audit Criteria`, ...(criteria.length ? criteria.map((item) => `- ${item.title}: ${item.description}`) : ["No criteria selected."])].join("\n");
}
