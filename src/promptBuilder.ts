import type { CriterionReview } from "./persistence";
import type { Skill } from "./skills";
import { principles, slopSignals } from "./knowledge";
import type { ProjectContext } from "./projectContext";
import { translateAudit } from "./skillLanguage";

export type FindingSeverity = "BLOCKER" | "HIGH" | "MEDIUM" | "LOW";
export type QualityState = "pass" | "fail" | "review" | "na";
export type Finding = { criterion: string; status: QualityState; problem: string; evidence: string; severity: FindingSeverity; fix: string; confidence: "High" | "Medium" | "Low" };
export const FINDING_OUTPUT_CONTRACT = ["Criterion", "Status (pass / fail / review / na)", "Problem", "Evidence (screen + element + exact text/value)", "Severity (BLOCKER / HIGH / MEDIUM / LOW)", "Fix (one concrete change)", "Confidence (High / Medium / Low)"] as const;
export const SEVERITY_DEFINITIONS = [
  "BLOCKER: The user cannot complete the task, loses data, or a verified WCAG A/AA failure blocks the core flow.",
  "HIGH: The task can be completed but is error-prone or undermines trust.",
  "MEDIUM: Slows the user down or requires extra thought, but they can recover independently.",
  "LOW: Polish issue that does not affect the task.",
];

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
  return filled;
}


export function reviewNotes(skill: Skill, reviews: Record<string, CriterionReview>, included: Record<string, boolean>): string[] {
  return skill.criteria.flatMap(criterion => {
    const review = reviews[criterion.id];
    if (!(included[criterion.id] ?? included[criterion.title] ?? true) || !review || (!review.checked && !review.status && !review.note.trim())) return [];
    return [`[${criterion.id}] ${criterion.title} — checked: ${review.checked ? "yes" : "no"}; status: ${review.status || "review"}${review.note.trim() ? `; notes: ${review.note.trim()}` : ""}`];
  });
}

export function checklistLines(skill: Skill, included: Record<string, boolean>): string[] {
  return skill.criteria.filter(c => included[c.id] ?? included[c.title] ?? true)
    .map(c => `[${c.id}] ${c.title} — ${translateAudit(c.description, "en")}`);
}

export function auditModule(skill: Skill, values: Record<string, string | string[]>, included: Record<string, boolean>, reviews: Record<string, CriterionReview>): string {
  const value = (id: string) => { const raw = values[id]; return (Array.isArray(raw) ? raw.join(", ") : raw?.trim()) || "Not provided — do not assume."; };
  const context = skill.inputs.filter(field => !["target", "user-goal", "artifact"].includes(field.id)).flatMap(field => {
    const raw = values[field.id]; const text = Array.isArray(raw) ? raw.join(", ") : raw?.trim();
    return text ? [`${field.label}: ${text}`] : [];
  });
  const notes = reviewNotes(skill, reviews, included);
  const checklist = checklistLines(skill, included);
  const replacements: Record<string, string> = {
    scope: skill.scopes.join(", "), target: value("target"), "user-goal": value("user-goal"), artifact: value("artifact"),
    "skill-inputs": context.join("\n") || "No skill-specific context has been provided yet.",
    "included-notes": "Reviewer notes are observations to validate, not verified facts.\n" + (notes.join("\n") || "None."),
    checklist: checklist.join("\n") || "No enabled criteria. Do not invent replacements.",
  };
  const template = skill.promptTemplate.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => replacements[key] ?? "Not provided.");
  const linkedPrinciples = skill.principleIds.flatMap(id => { const p = principles.find(item => item.id === id); return p ? [`- ${p.id}: ${p.statement}`] : []; });
  const signals = skill.slopSignalIds.flatMap(id => { const signal = slopSignals.find(item => item.id === id); return signal ? [`- ${signal.id}: ${signal.evidencePattern}`] : []; });
  return [template, "DETECT: " + skill.detects.join(", "), "PRINCIPLES", ...linkedPrinciples,
    ...(signals.length ? ["AI SLOP EVIDENCE PATTERNS", ...signals] : []),
    ...(skill.id === "heuristic-sweep" ? ["Add one line: Recommended deep-dive: [skill IDs]. Choose from purpose-fit, task-flow, flow-completeness, state-recovery, ia-labels, content-truth, cognitive-load, visual-hierarchy, ai-visual-slop, design-system, responsive, accessibility."] : []),
    ...(skill.id === "task-flow" ? ["Apply criteria task-flow.2 through task-flow.4 at every step. Record each failed step with evidence."] : []),
    ...(skill.id === "accessibility" ? ["Screenshots cannot verify exact contrast or real keyboard behavior. Mark accessibility.1 and accessibility.4 as review until verified with tools and manual testing. Automated tools do not replace manual testing."] : []),
  ].join("\n\n");
}

export function buildAuditPrompt(skill: Skill, values: Record<string, string | string[]>, included: Record<string, boolean>, projectContext: ProjectContext = {}, reviews: Record<string, CriterionReview> = {}): string {
  const context = projectContextLines(projectContext);
  return [`# UX QUALITY AUDIT — ${skill.name}`, ...(context.length ? ["## PROJECT CONTEXT", ...context] : []),
    auditModule(skill, values, included, reviews), "## SEVERITY", ...SEVERITY_DEFINITIONS,
    "## OUTPUT CONTRACT", ...skill.outputContract.map(field => `- ${field}`),
    "Low confidence means validation with real users is needed. Do not produce an overall numeric score.",
  ].join("\n\n");
}
export function buildCriteriaOnly(skill: Skill, included: Record<string, boolean>): string {
  return [`# ${skill.name} — Audit Criteria`, ...checklistLines(skill, included)].join("\n");
}
