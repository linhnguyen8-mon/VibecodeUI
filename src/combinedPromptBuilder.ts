import type { ReviewState } from "./persistence";
import type { Skill } from "./skills";
import type { ProjectContext } from "./projectContext";
import { auditModule, FINDING_OUTPUT_CONTRACT, SEVERITY_DEFINITIONS, projectContextLines } from "./promptBuilder";

export function buildCombinedAuditPrompt(selectedSkills: Skill[], skillValues: Record<string, Record<string, string | string[]>>, includedCriteria: Record<string, Record<string, boolean>>, projectContext: ProjectContext = {}, reviews: ReviewState = {}): string {
  const context = projectContextLines(projectContext);
  return [
    "# COMBINED UX QUALITY AUDIT",
    ...(context.length ? ["## PROJECT CONTEXT", ...context] : []),
    "Review only the selected modules. Each criterion fails only when its FAIL IF condition is met. Insufficient evidence means review, never guessed pass or fail.",
    "Merge duplicate findings by root cause across modules and reference the relevant criterion IDs. Return one consolidated status table, findings sorted BLOCKER to LOW, and the top three concrete fixes.",
    ...selectedSkills.map((skill, index) => [`### AUDIT MODULE ${index + 1} — ${skill.name}`, auditModule(skill, skillValues[skill.id] ?? {}, includedCriteria[skill.id] ?? {}, reviews[skill.id] ?? {})].join("\n\n")),
    "## SEVERITY", ...SEVERITY_DEFINITIONS,
    "## OUTPUT CONTRACT", ...FINDING_OUTPUT_CONTRACT.map(field => `- ${field}`),
    "Low confidence means validation with real users is needed. Do not produce an overall numeric score.",
  ].join("\n\n");
}
