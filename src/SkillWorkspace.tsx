import { useMemo, useState } from "react";
import { skills, type Skill } from "./skills";
import { frameworks, principles, slopSignals } from "./knowledge";
import { buildAuditPrompt, buildCriteriaOnly } from "./promptBuilder";
import { auditSets } from "./auditSets";
import { buildCombinedAuditPrompt } from "./combinedPromptBuilder";
import type { ProjectContext } from "./projectContext";
import "./skills.css";

type ToastMessage = { tone: "success" | "error" | "info"; text: string };

export function SkillWorkspace({ query, onToast }: { query: string; onToast: (toast: ToastMessage) => void }) {
  const groups = [...new Set(skills.map((skill) => skill.group))];
  const stages = [...new Set(skills.flatMap((skill) => skill.stages))];
  const scopes = [...new Set(skills.flatMap((skill) => skill.scopes))];
  const problems = [...new Set(skills.flatMap((skill) => skill.problems))];
  const [group, setGroup] = useState("All groups");
  const [stage, setStage] = useState("All stages");
  const [scope, setScope] = useState("All scopes");
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("visual-hierarchy");
  const [inputValues, setInputValues] = useState<Record<string, Record<string, string | string[]>>>({});
  const [includedCriteria, setIncludedCriteria] = useState<Record<string, Record<string, boolean>>>({});
  const quickFilters: Record<string, string[]> = {
    "Looks generic": ["context-specificity", "ai-visual-slop", "cardification-detector"],
    "Hard to understand": ["purpose-validator", "information-architecture", "cognitive-load"],
    "Hard to navigate": ["information-architecture", "task-flow"],
    "Too cluttered": ["cognitive-load", "visual-hierarchy", "cardification-detector"],
    "Too empty": ["purpose-validator", "visual-hierarchy"],
    "Flow feels awkward": ["task-flow", "error-recovery"],
    "Missing states": ["state-coverage", "error-recovery"],
    "UI inconsistent": ["design-system-compliance", "state-coverage"],
    "Doesn't feel trustworthy": ["purpose-validator", "context-specificity", "error-recovery", "accessibility-core"],
  };
  const visible = useMemo(() => skills.filter((skill) => {
    const matchesQuery = `${skill.name} ${skill.shortDescription} ${skill.group} ${skill.detects.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const matchesProblems = selectedProblems.length === 0 || selectedProblems.some((problem) => skill.problems.includes(problem));
    return matchesQuery && matchesProblems && (group === "All groups" || skill.group === group) && (stage === "All stages" || skill.stages.includes(stage)) && (scope === "All scopes" || skill.scopes.includes(scope));
  }), [query, group, stage, scope, selectedProblems]);
  const relevantIds = quickFilter ? quickFilters[quickFilter] : [];
  const quickMatches = quickFilter ? visible.filter((skill) => relevantIds.includes(skill.id)) : [];
  const selected = visible.find((skill) => skill.id === selectedId) ?? quickMatches[0] ?? visible[0];
  return <section className="skills-workspace" aria-label="Design quality skills">
    <div className="skills-toolbar">
      <div><p className="skills-eyebrow">DESIGN PRINCIPLES</p><h1>Design Quality Skills</h1><p className="skills-subtitle">A focused workspace for reviewing product experience quality.</p></div>
      <div className="skills-filters">
        <label><span>Group</span><select value={group} onChange={(e) => setGroup(e.target.value)}><option>All groups</option>{groups.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Stage</span><select value={stage} onChange={(e) => setStage(e.target.value)}><option>All stages</option>{stages.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Scope</span><select value={scope} onChange={(e) => setScope(e.target.value)}><option>All scopes</option>{scopes.map((item) => <option key={item}>{item}</option>)}</select></label>
        <details className="problem-filter"><summary>Problem{selectedProblems.length > 0 && <span className="filter-badge">{selectedProblems.length}</span>}</summary><div className="problem-menu">{problems.map((problem) => <label key={problem}><input type="checkbox" aria-label={`Filter problem: ${problem}`} checked={selectedProblems.includes(problem)} onChange={() => setSelectedProblems((current) => current.includes(problem) ? current.filter((item) => item !== problem) : [...current, problem])} /><span>{problem}</span></label>)}</div></details>
      </div>
    </div>
    <div className="quick-filter-bar"><div className="quick-filter-heading"><strong>What feels wrong?</strong><span>Quickly focus the skills that can help.</span></div><div className="quick-filter-options">{Object.keys(quickFilters).map((item) => <button key={item} className={quickFilter === item ? "active" : ""} aria-pressed={quickFilter === item} onClick={() => { const next = quickFilter === item ? null : item; setQuickFilter(next); if (next) setSelectedId(quickFilters[next][0]); }}>{item}</button>)}</div>{quickFilter && <span className="quick-match-count">{quickMatches.length} matching skills</span>}</div>
    <AuditSetWorkspace inputValues={inputValues} includedCriteria={includedCriteria} onToast={onToast} />
    <div className="skills-split">
      <div className="skills-browser" aria-label="Skill browser">
        <div className="skills-results"><strong>{visible.length} skills</strong><span>Choose a skill to inspect its criteria</span></div>
        {visible.length ? <div className="skills-grid">{visible.map((skill) => <SkillCard key={skill.id} skill={skill} selected={skill.id === selected?.id} relevant={!!quickFilter && relevantIds.includes(skill.id)} dimmed={!!quickFilter && !relevantIds.includes(skill.id)} onClick={() => setSelectedId(skill.id)} />)}</div> : <div className="skills-empty">No skills match these filters. Try another search or filter.</div>}
      </div>
      <aside className="skill-inspector" aria-label="Skill workspace">
        {selected ? <Inspector key={selected.id} skill={selected} values={inputValues[selected.id] ?? {}} onInputChange={(fieldId, value) => setInputValues((current) => ({ ...current, [selected.id]: { ...current[selected.id], [fieldId]: value } }))} onResetInputs={() => setInputValues((current) => ({ ...current, [selected.id]: {} }))} includedCriteria={includedCriteria[selected.id] ?? {}} onCriterionToggle={(title) => setIncludedCriteria((current) => ({ ...current, [selected.id]: { ...current[selected.id], [title]: !(current[selected.id]?.[title] ?? true) } }))} onToast={onToast} /> : <div className="inspector-empty">Select a skill to inspect its criteria.</div>}
      </aside>
    </div>
  </section>;
}

function AuditSetWorkspace({ inputValues, includedCriteria, onToast }: { inputValues: Record<string, Record<string, string | string[]>>; includedCriteria: Record<string, Record<string, boolean>>; onToast: (toast: ToastMessage) => void }) {
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [skillOverrides, setSkillOverrides] = useState<Record<string, string[]>>({});
  const [showPreview, setShowPreview] = useState(false);
  const activeSet = auditSets.find((set) => set.id === activeSetId);
  const skillIds = activeSet ? skillOverrides[activeSet.id] ?? activeSet.skillIds : [];
  const selectedSkills = skillIds.map((id) => skills.find((skill) => skill.id === id)).filter((skill) => skill !== undefined);
  const prompt = activeSet && showPreview ? buildCombinedAuditPrompt(selectedSkills, inputValues, includedCriteria, {}) : null;

  const toggleSkill = (skillId: string) => {
    if (!activeSet) return;
    setSkillOverrides((current) => ({
      ...current,
      [activeSet.id]: skillIds.includes(skillId) ? skillIds.filter((id) => id !== skillId) : [...skillIds, skillId],
    }));
    setShowPreview(false);
  };

  return <section className="audit-sets-workspace" aria-label="Audit sets">
    <div className="audit-sets-heading"><div><h2>Audit Sets</h2><p>Combine focused skill reviews into one exportable prompt.</p></div></div>
    <div className="audit-set-options">{auditSets.map((set) => <button key={set.id} className={`audit-set-option${activeSetId === set.id ? " active" : ""}`} aria-pressed={activeSetId === set.id} onClick={() => { setActiveSetId(set.id); setShowPreview(false); }}><strong>{set.name}</strong><span>{set.description}</span></button>)}</div>
    {activeSet && <div className="audit-set-config"><div className="audit-set-config-heading"><div><strong>{activeSet.name}</strong><span>{selectedSkills.length} of {skills.filter((skill) => activeSet.skillIds.includes(skill.id)).length} selected</span></div><p>Choose which skills to include.</p></div><div className="audit-set-skill-list">{activeSet.skillIds.map((id) => { const skill = skills.find((item) => item.id === id); return skill ? <label key={id}><input type="checkbox" checked={skillIds.includes(id)} onChange={() => toggleSkill(id)} /><span>{skill.name}</span></label> : null; })}</div><button type="button" className="generate-combined-button" disabled={selectedSkills.length === 0} onClick={() => setShowPreview(true)}>Generate Combined Prompt</button>
      {prompt && <div className="combined-prompt-result"><details><summary>Preview combined prompt <span>{prompt.length.toLocaleString()} characters</span></summary><pre>{prompt}</pre></details><button type="button" className="text-action" onClick={() => void copyText(prompt, "prompt", () => undefined, onToast)}>Copy Combined Prompt</button></div>}
    </div>}
  </section>;
}

function SkillCard({ skill, selected, relevant, dimmed, onClick }: { skill: Skill; selected: boolean; relevant: boolean; dimmed: boolean; onClick: () => void }) {
  return <button className={`skill-card${selected ? " selected" : ""}${relevant ? " relevant" : ""}${dimmed ? " dimmed" : ""}`} onClick={onClick} aria-pressed={selected}>
    <span className="skill-card-top"><span className="skill-group">{skill.group}</span><span className="criteria-count">{skill.criteria.length} criteria</span></span>
    <strong>{skill.name}</strong><span className="skill-description">{skill.shortDescription}</span>
    <span className="scope-tags">{skill.scopes.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</span>
  </button>;
}

function Inspector({ skill, values, onInputChange, onResetInputs, includedCriteria, onCriterionToggle, onToast }: { skill: Skill; values: Record<string, string | string[]>; onInputChange: (fieldId: string, value: string | string[]) => void; onResetInputs: () => void; includedCriteria: Record<string, boolean>; onCriterionToggle: (title: string) => void; onToast: (toast: ToastMessage) => void }) {
  const [copied, setCopied] = useState<"prompt" | "criteria" | null>(null);
  const projectContext: ProjectContext = {};
  const prompt = buildAuditPrompt(skill, values, includedCriteria, projectContext);
  const criteriaOnly = buildCriteriaOnly(skill, includedCriteria);
  const linkedPrinciples = skill.principleIds.map((id) => principles.find((item) => item.id === id)).filter((item) => item !== undefined);
  const linkedFrameworks = skill.frameworkSourceIds.map((id) => frameworks.find((item) => item.id === id)).filter((item) => item !== undefined);
  const linkedSlopSignals = skill.slopSignalIds.map((id) => slopSignals.find((item) => item.id === id)).filter((item) => item !== undefined);
  return <div className="inspector-content" key={skill.id}>
    <div className="inspector-heading"><span className="skills-eyebrow">SKILL WORKSPACE</span><h2>{skill.name}</h2></div>
    <InspectorSection title="Purpose"><p>{skill.shortDescription}</p></InspectorSection>
    <InspectorSection title="Detects"><ul>{skill.detects.map((item) => <li key={item}>{item}</li>)}</ul></InspectorSection>
    <InspectorSection title="When to use"><p>{skill.whenToUse}</p></InspectorSection>
    <section className="inspector-section"><div className="inspector-section-title"><h3>Context inputs</h3><button type="button" className="text-action" aria-label={`Reset ${skill.name} context inputs`} onClick={onResetInputs}>Reset</button></div><div className="skill-input-list">{skill.inputs.length ? skill.inputs.map((field) => <SkillContextField key={field.id} field={field} value={values[field.id] ?? (field.type === "multiselect" ? [] : "")} onChange={(value) => onInputChange(field.id, value)} />) : <p>This skill has no additional context inputs.</p>}</div></section>
    <InspectorSection title="Criteria"><p className="criteria-hint">Use these criteria to understand the review focus. Clear any that should be excluded.</p><ol className="criteria-list">{skill.criteria.map((criterion) => <li key={criterion.title}><label className="criterion-toggle"><input type="checkbox" aria-label={`Include criterion: ${criterion.title}`} checked={includedCriteria[criterion.title] ?? true} onChange={() => onCriterionToggle(criterion.title)} /><span className="criterion-copy"><strong>{criterion.title}</strong><span>{criterion.description}</span>{criterion.principle && <small>{criterion.principle}</small>}</span></label></li>)}</ol></InspectorSection>
    <InspectorSection title="Hard rules" collapsible><ul>{skill.hardRules.map((rule) => <li key={rule}>{rule}</li>)}</ul></InspectorSection>
    {linkedSlopSignals.length > 0 && <InspectorSection title="AI slop signals" collapsible><ul className="knowledge-list">{linkedSlopSignals.map((signal) => <li key={signal.id}><strong>{signal.name}</strong><span>{signal.description}</span></li>)}</ul></InspectorSection>}
    <InspectorSection title="Design principles" collapsible><ul className="knowledge-list">{linkedPrinciples.map((principle) => <li key={principle.id}><strong>{principle.name}</strong><span>{principle.statement}</span></li>)}</ul></InspectorSection>
    <InspectorSection title="Framework sources" collapsible><div className="framework-tags">{linkedFrameworks.map((framework) => <span key={framework.id} title={framework.summary}>{framework.name}</span>)}</div></InspectorSection>
    <section className="inspector-section prompt-builder-section"><h3>Generated Prompt</h3><details className="generated-prompt"><summary>Preview prompt <span>{prompt.length.toLocaleString()} characters</span></summary><pre>{prompt}</pre></details><div className="prompt-actions"><button type="button" className="copy-prompt-button" onClick={() => void copyText(prompt, "prompt", setCopied, onToast)}>{copied === "prompt" ? "Copied" : "Copy Audit Prompt"}</button><button type="button" className="text-action" onClick={() => void copyText(criteriaOnly, "criteria", setCopied, onToast)}>{copied === "criteria" ? "Criteria copied" : "Copy Criteria Only"}</button></div></section>
  </div>;
}

async function copyText(value: string, kind: "prompt" | "criteria", setCopied: (kind: "prompt" | "criteria" | null) => void, onToast: (toast: ToastMessage) => void) {
  try {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    onToast({ tone: "success", text: kind === "prompt" ? "Audit prompt copied" : "Criteria copied" });
  } catch {
    setCopied(null);
    onToast({ tone: "error", text: "Could not copy. Check browser clipboard access and try again." });
  }
}

function SkillContextField({ field, value, onChange }: { field: Skill["inputs"][number]; value: string | string[]; onChange: (value: string | string[]) => void }) {
  const controlId = `skill-${field.id}`;
  const label = <span className="context-field-label">{field.label}{field.required && <em>Required</em>}</span>;
  if (field.type === "multiselect") return <fieldset className="skill-context-field"><legend>{label}</legend><div className="multi-input-options">{(field.options ?? []).map((option) => <label key={option}><input type="checkbox" checked={Array.isArray(value) && value.includes(option)} onChange={() => { const current = Array.isArray(value) ? value : []; onChange(current.includes(option) ? current.filter((item) => item !== option) : [...current, option]); }} />{option}</label>)}</div>{field.helperText && <small>{field.helperText}</small>}</fieldset>;
  return <label className="skill-context-field" htmlFor={controlId}>
    {label}
    {field.type === "textarea" ? <textarea id={controlId} placeholder={field.placeholder} value={Array.isArray(value) ? value.join("\n") : value} onChange={(event) => onChange(event.target.value)} />
      : field.type === "select" ? <select id={controlId} value={Array.isArray(value) ? value[0] ?? "" : value} onChange={(event) => onChange(event.target.value)}><option value="">Choose one</option>{(field.options ?? []).map((option) => <option key={option}>{option}</option>)}</select>
      : <input id={controlId} type="text" placeholder={field.placeholder} value={Array.isArray(value) ? value.join(", ") : value} onChange={(event) => onChange(event.target.value)} />}
    {field.helperText && <small>{field.helperText}</small>}
  </label>;
}

function InspectorSection({ title, children, collapsible = false }: { title: string; children: React.ReactNode; collapsible?: boolean }) {
  return collapsible
    ? <details className="inspector-section inspector-section-collapsible"><summary>{title}</summary>{children}</details>
    : <section className="inspector-section"><h3>{title}</h3>{children}</section>;
}
