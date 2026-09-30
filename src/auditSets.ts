export type AuditSet = { id: string; name: string; description: string; skillIds: string[] };

export const auditSets: AuditSet[] = [
  {
    id: "ai-slop-sweep",
    name: "AI Slop Sweep",
    description: "Look for generic, over-decorated, context-free UI patterns.",
    skillIds: ["context-specificity", "visual-hierarchy", "cardification-detector", "ai-visual-slop", "state-coverage", "design-system-compliance"],
  },
  {
    id: "ux-health-check",
    name: "UX Health Check",
    description: "Review purpose, findability, task completion, comprehension, and access.",
    skillIds: ["purpose-validator", "information-architecture", "task-flow", "state-coverage", "cognitive-load", "visual-hierarchy", "accessibility-core"],
  },
  {
    id: "pre-ship-review",
    name: "Pre-ship Review",
    description: "Check high-risk journeys, failures, system consistency, responsive behavior, and access.",
    skillIds: ["task-flow", "state-coverage", "error-recovery", "design-system-compliance", "accessibility-core", "responsive-layout"],
  },
];
