import registry from "./qaSkills.json";
export type SkillGroup = "Triage" | "Flow" | "Content" | "Visual" | "Build";
export type SkillInput = { id: string; label: string; type: "text" | "textarea" | "select" | "multiselect"; placeholder?: string; required?: boolean; helperText?: string; options?: string[] };
export type SkillCriterion = { id: string; title: string; description: string; principle?: string };
export type Skill = {
  id: string; name: string; shortDescription: string; group: SkillGroup; scopes: string[]; stages: string[]; problems: string[];
  detects: string[]; whenToUse: string; inputs: SkillInput[]; principleIds: string[]; criteria: SkillCriterion[];
  slopSignalIds: string[]; outputContract: string[]; promptTemplate: string; cardEN: string;
};
const skillTitles: Record<string, string> = {
  "heuristic-sweep": "Heuristic Sweep",
  "purpose-fit": "Purpose & Context Fit",
  "task-flow": "Task Walkthrough",
  "flow-completeness": "Dead Ends & Missing Paths",
  "state-recovery": "States & Recovery",
  "ia-labels": "IA & Labels",
  "content-truth": "Content Truth",
  "cognitive-load": "Cognitive Load",
  "visual-hierarchy": "Visual Hierarchy",
  "ai-visual-slop": "AI Visual Slop",
  "design-system": "Design System",
  responsive: "Responsive",
  accessibility: "Accessibility",
};
export const skills: Skill[] = (registry as Skill[]).map(skill => ({
  ...skill,
  name: skillTitles[skill.id],
}));
