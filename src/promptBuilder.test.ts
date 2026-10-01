import { describe, expect, it } from "vitest";
import { skills } from "./skills";
import { auditSets } from "./auditSets";
import { buildCombinedAuditPrompt } from "./combinedPromptBuilder";
import { buildAuditPrompt, buildCriteriaOnly } from "./promptBuilder";

describe("skill audit prompt assembly", () => {
  const taskFlow = skills.find((skill) => skill.id === "task-flow")!;

  it("omits removed project context when none is supplied", () => {
    const prompt = buildAuditPrompt(taskFlow, {}, {}, {});
    expect(prompt).not.toContain("PROJECT CONTEXT");
    expect(prompt).toContain("No skill-specific context has been provided yet.");
  });

  it("includes supplied project and skill context", () => {
    const prompt = buildAuditPrompt(taskFlow, { task: "Transfer funds" }, {}, { productName: "Sample Bank" });
    expect(prompt).toContain("Product: Sample Bank");
    expect(prompt).toContain("Task: Transfer funds");
  });

  it("omits disabled criteria from prompts and criteria exports", () => {
    const [first, ...rest] = taskFlow.criteria;
    const included = { [first.title]: false };
    expect(buildAuditPrompt(taskFlow, {}, included)).not.toContain(first.title);
    expect(buildCriteriaOnly(taskFlow, included)).not.toContain(first.title);
    expect(rest.every((criterion) => buildCriteriaOnly(taskFlow, included).includes(criterion.title))).toBe(true);
  });

  it("deduplicates project context and output contract in a combined audit", () => {
    const set = auditSets.find((auditSet) => auditSet.id === "ux-health-check")!;
    const members = set.skillIds.map((id) => skills.find((skill) => skill.id === id)!).filter(Boolean);
    const prompt = buildCombinedAuditPrompt(members, {}, {}, { productName: "Sample Bank" });
    expect(prompt.match(/Product: Sample Bank/g)).toHaveLength(1);
    expect(prompt.match(/## OUTPUT CONTRACT/g)).toHaveLength(1);
    expect(prompt).toContain("### AUDIT MODULE 1");
  });
});
