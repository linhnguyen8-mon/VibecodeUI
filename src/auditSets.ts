export type AuditSet = { id: string; name: string; description: string; skillIds: string[] };
export const auditSets: AuditSet[] = [
  { id: "ai-gen-minimum", name: "AI-gen minimum", description: "Start with the minimum review for every AI-generated flow.", skillIds: ["heuristic-sweep", "flow-completeness", "content-truth"] },
  { id: "onboarding-signup", name: "Onboarding / Signup", description: "Run after the AI-gen minimum: task flow, cognitive load, and recovery.", skillIds: ["task-flow", "cognitive-load", "state-recovery"] },
  { id: "checkout-payment", name: "Checkout / Payment", description: "Run after the AI-gen minimum: task flow, recovery, and accessibility.", skillIds: ["task-flow", "state-recovery", "accessibility"] },
  { id: "dashboard-data", name: "Dashboard / Data", description: "Run after the AI-gen minimum: comprehension, hierarchy, and states.", skillIds: ["cognitive-load", "visual-hierarchy", "state-recovery"] },
  { id: "landing-page", name: "Landing page", description: "Run after the AI-gen minimum: purpose, hierarchy, and visual slop.", skillIds: ["purpose-fit", "visual-hierarchy", "ai-visual-slop"] },
  { id: "dev-handoff", name: "Dev handoff", description: "Review components, responsive behavior, and accessibility before handoff.", skillIds: ["design-system", "responsive", "accessibility"] },
];
