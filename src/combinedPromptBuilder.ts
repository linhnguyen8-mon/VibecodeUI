import type { Skill } from "./skills";
import { frameworks, principles, slopSignals } from "./knowledge";
import type { ProjectContext } from "./projectContext";
import { FINDING_OUTPUT_CONTRACT, projectContextLines } from "./promptBuilder";

export function buildCombinedAuditPrompt(
  selectedSkills: Skill[],
  skillValues: Record<string, Record<string, string | string[]>>,
  includedCriteria: Record<string, Record<string, boolean>>,
  projectContext: ProjectContext = {},
): string {
  const uniquePrinciples = [...new Set(selectedSkills.flatMap((skill) => skill.principleIds))]
    .map((id) => principles.find((item) => item.id === id)).filter((item) => item !== undefined);
  const sharedHardRules = [...new Set(selectedSkills.flatMap((skill) => skill.hardRules))];
  const modules = selectedSkills.map((skill, index) => {
    const values = skillValues[skill.id] ?? {};
    const inputs = skill.inputs.flatMap((field) => {
      const value = values[field.id];
      const text = Array.isArray(value) ? value.join(", ") : value?.trim();
      return text ? [`- ${field.label}: ${text}`] : [];
    });
    const enabledCriteria = skill.criteria.filter((item) => includedCriteria[skill.id]?.[item.title] ?? true);
    const sources = skill.frameworkSourceIds.map((id) => frameworks.find((item) => item.id === id)).filter((item) => item !== undefined);
    const signals = skill.slopSignalIds.map((id) => slopSignals.find((item) => item.id === id)).filter((item) => item !== undefined);
    const objective = skill.promptTemplate
      .replaceAll("{{skillName}}", skill.name)
      .replaceAll("{{detects}}", skill.detects.join(", "))
      .replaceAll("{{scope}}", skill.scopes.join(", "))
      .replaceAll("{{whenToUse}}", skill.whenToUse);
    return [
      `### AUDIT MODULE ${index + 1} — ${skill.name}`,
      `Objective: ${objective}`,
      `Review scope: ${skill.scopes.join(", ")}.`,
      `Detect: ${skill.detects.join(", ")}.`,
      "Skill context:", ...(inputs.length ? inputs : ["- No additional skill context provided."]),
      "Criteria:", ...(enabledCriteria.length ? enabledCriteria.map((item) => `- ${item.title}: ${item.description}`) : ["- No enabled criteria. Do not invent replacements."]),
      "Framework sources:", ...(sources.length ? sources.map((item) => `- ${item.name}`) : ["- None"]),
      "Relevant AI slop signals:", ...(signals.length ? signals.map((item) => `- ${item.name}: ${item.description} Evidence pattern: ${item.evidencePattern} Rationale: ${item.rationale}`) : ["- None"]),
    ].join("\n");
  });

  return [
    "# COMBINED UX QUALITY AUDIT",
    "## ROLE",
    "Act as a senior product design audit lead coordinating focused specialist reviews.",
    "## PROJECT CONTEXT",
    ...projectContextLines(projectContext),
    "## SHARED DESIGN PRINCIPLES",
    ...(uniquePrinciples.length ? uniquePrinciples.map((item) => `- ${item.name}: ${item.statement} Rationale: ${item.rationale}`) : ["- No shared principles linked."]),
    "## SHARED HARD RULES",
    ...sharedHardRules.map((rule) => `- ${rule}`),
    "## INSPECTION INSTRUCTIONS",
    "- Inspect the actual implementation and cite concrete screens, components, states, or content.",
    "- Do not give generic UX advice or invent product requirements.",
    "- Identify evidence before recommending a change; distinguish evidence from assumptions.",
    "- Do not redesign before explaining the observed issue.",
    "- Report related findings once and reference all relevant audit modules.",
    "## AUDIT MODULES",
    ...modules,
    "## OUTPUT CONTRACT",
    "Return one finding per distinct issue using these fields:",
    ...FINDING_OUTPUT_CONTRACT.map((field) => `- ${field}`),
    "Use quality state Pass, Warning, Fail, or N/A only when reporting a criterion status. Do not produce a numeric overall score.",
  ].join("\n\n");
}
