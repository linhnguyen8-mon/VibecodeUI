import { useMemo, useState } from "react";
import { skills, type Skill } from "./skills";
import { frameworks, principles, slopSignals } from "./knowledge";
import { buildAuditPrompt, buildCriteriaOnly } from "./promptBuilder";
import { auditSets } from "./auditSets";
import { buildCombinedAuditPrompt } from "./combinedPromptBuilder";
import type { ProjectContext } from "./projectContext";
import { defaultDesignQualityState, type AuditSetConfig, type DesignQualityState } from "./persistence";
import "./skills.css";

type ToastMessage = { tone: "success" | "error" | "info"; text: string };
type Props = { query: string; onQueryChange: (value: string) => void; state: DesignQualityState; onStateChange: (update: (current: DesignQualityState) => DesignQualityState) => void; storageWarning: string; onToast: (toast: ToastMessage) => void };

export function SkillWorkspace({ query, onQueryChange, state, onStateChange, storageWarning, onToast }: Props) {
  const { filters } = state;
  const [contextOpen, setContextOpen] = useState(false);
  const groups = [...new Set(skills.map((skill) => skill.group))];
  const stages = [...new Set(skills.flatMap((skill) => skill.stages))];
  const scopes = [...new Set(skills.flatMap((skill) => skill.scopes))];
  const problems = [...new Set(skills.flatMap((skill) => skill.problems))];
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
  const patchFilters = (patch: Partial<DesignQualityState["filters"]>) => onStateChange((current) => ({ ...current, filters: { ...current.filters, ...patch } }));
  const visible = useMemo(() => skills.filter((skill) => {
    const matchesQuery = `${skill.name} ${skill.shortDescription} ${skill.group} ${skill.detects.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const matchesProblems = filters.selectedProblems.length === 0 || filters.selectedProblems.some((problem) => skill.problems.includes(problem));
    return matchesQuery && matchesProblems && (filters.group === "All groups" || skill.group === filters.group) && (filters.stage === "All stages" || skill.stages.includes(filters.stage)) && (filters.scope === "All scopes" || skill.scopes.includes(filters.scope));
  }), [query, filters]);
  const relevantIds = filters.quickFilter ? quickFilters[filters.quickFilter] : [];
  const quickMatches = filters.quickFilter ? visible.filter((skill) => relevantIds.includes(skill.id)) : [];
  const selected = visible.find((skill) => skill.id === state.selectedSkillId) ?? quickMatches[0] ?? visible[0];
  const contextCount = Object.values(state.projectContext).filter((value) => Array.isArray(value) ? value.length > 0 : !!value?.trim()).length;
  const registryIssues = skills.flatMap((skill, index) => {
    const issues: string[] = [];
    if (!skill.id?.trim() || !skill.name?.trim() || !skill.group?.trim()) issues.push(`Skill registry entry ${index + 1} is missing an ID, name, or group.`);
    if (!Array.isArray(skill.criteria) || !Array.isArray(skill.scopes) || !Array.isArray(skill.stages)) issues.push(`${skill.name || `Entry ${index + 1}`} has incomplete registry data.`);
    return issues;
  });
  const setContext = (projectContext: ProjectContext) => onStateChange((current) => ({ ...current, projectContext }));
  const resetAll = () => {
    if (!window.confirm("Reset all saved Design Quality Skills data? This clears project context, skill inputs, filters, and audit set choices.")) return;
    onStateChange(() => defaultDesignQualityState);
    onQueryChange("");
    onToast({ tone: "info", text: "Workspace reset" });
  };
  return <section className="skills-workspace" aria-label="Design quality skills">
    {storageWarning && <div className="workspace-notice" role="status">{storageWarning}</div>}
    {registryIssues.length > 0 && <div className="workspace-notice error" role="alert">Some skill registry entries are invalid: {registryIssues.join(" ")}</div>}
    <div className="skills-toolbar">
      <div><p className="skills-eyebrow">DESIGN PRINCIPLES</p><h1>Design Quality Skills</h1><p className="skills-subtitle">A focused workspace for reviewing product experience quality.</p></div>
      <div className="skills-filters">
        <label><span>Group</span><select value={filters.group} onChange={(e) => patchFilters({ group: e.target.value })}><option>All groups</option>{groups.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Stage</span><select value={filters.stage} onChange={(e) => patchFilters({ stage: e.target.value })}><option>All stages</option>{stages.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Scope</span><select value={filters.scope} onChange={(e) => patchFilters({ scope: e.target.value })}><option>All scopes</option>{scopes.map((item) => <option key={item}>{item}</option>)}</select></label>
        <details className="problem-filter"><summary>Problem{filters.selectedProblems.length > 0 && <span className="filter-badge">{filters.selectedProblems.length}</span>}</summary><div className="problem-menu">{problems.map((problem) => <label key={problem}><input type="checkbox" aria-label={`Filter problem: ${problem}`} checked={filters.selectedProblems.includes(problem)} onChange={() => patchFilters({ selectedProblems: filters.selectedProblems.includes(problem) ? filters.selectedProblems.filter((item) => item !== problem) : [...filters.selectedProblems, problem] })} /><span>{problem}</span></label>)}</div></details>
      </div>
    </div>
    <div className="context-toolbar"><button className="context-toggle" type="button" aria-expanded={contextOpen} onClick={() => setContextOpen((open) => !open)}>Project Context <span>{contextCount}/11 fields provided</span></button><button type="button" className="text-action" onClick={resetAll}>Reset all</button></div>
    {contextOpen && <ProjectContextPanel value={state.projectContext} onChange={setContext} onReset={() => setContext({})} />}
    <div className="quick-filter-bar"><div className="quick-filter-heading"><strong>What feels wrong?</strong><span>Quickly focus the skills that can help.</span></div><div className="quick-filter-options">{Object.keys(quickFilters).map((item) => <button key={item} className={filters.quickFilter === item ? "active" : ""} aria-pressed={filters.quickFilter === item} onClick={() => { const next = filters.quickFilter === item ? null : item; patchFilters({ quickFilter: next }); if (next) onStateChange((current) => ({ ...current, selectedSkillId: quickFilters[next][0] })); }}>{item}</button>)}</div>{filters.quickFilter && <span className="quick-match-count">{quickMatches.length} matching skills</span>}</div>
    <AuditSetWorkspace inputValues={state.skillInputs} includedCriteria={state.selectedCriteria} projectContext={state.projectContext} config={state.auditSetConfig} onConfigChange={(auditSetConfig) => onStateChange((current) => ({ ...current, auditSetConfig }))} onToast={onToast} />
    <div className="skills-split">
      <div className="skills-browser" aria-label="Skill browser">
        <div className="skills-results" aria-live="polite"><strong>{visible.length} skills</strong><span>Choose a skill to inspect its criteria</span>{(query || filters.group !== "All groups" || filters.stage !== "All stages" || filters.scope !== "All scopes" || filters.selectedProblems.length || filters.quickFilter) ? <button className="text-action" type="button" onClick={() => { onQueryChange(""); patchFilters({ group: "All groups", stage: "All stages", scope: "All scopes", selectedProblems: [], quickFilter: null }); }}>Clear filters</button> : null}</div>
        {visible.length ? <div className="skills-grid">{visible.map((skill) => <SkillCard key={skill.id} skill={skill} selected={skill.id === selected?.id} relevant={!!filters.quickFilter && relevantIds.includes(skill.id)} dimmed={!!filters.quickFilter && !relevantIds.includes(skill.id)} onClick={() => onStateChange((current) => ({ ...current, selectedSkillId: skill.id }))} />)}</div> : <div className="skills-empty">No skills match these filters. Try another search or filter.</div>}
      </div>
      <aside className="skill-inspector" aria-label="Skill workspace">
        {selected ? <Inspector key={selected.id} skill={selected} values={state.skillInputs[selected.id] ?? {}} projectContext={state.projectContext} onInputChange={(fieldId, value) => onStateChange((current) => ({ ...current, skillInputs: { ...current.skillInputs, [selected.id]: { ...current.skillInputs[selected.id], [fieldId]: value } } }))} onResetInputs={() => onStateChange((current) => ({ ...current, skillInputs: { ...current.skillInputs, [selected.id]: {} } }))} includedCriteria={state.selectedCriteria[selected.id] ?? {}} onCriterionToggle={(title) => onStateChange((current) => ({ ...current, selectedCriteria: { ...current.selectedCriteria, [selected.id]: { ...current.selectedCriteria[selected.id], [title]: !(current.selectedCriteria[selected.id]?.[title] ?? true) } } }))} onToast={onToast} /> : <div className="inspector-empty">Select a skill to inspect its criteria.</div>}
      </aside>
    </div>
  </section>;
}

function AuditSetWorkspace({ inputValues, includedCriteria, projectContext, config, onConfigChange, onToast }: { inputValues: DesignQualityState["skillInputs"]; includedCriteria: DesignQualityState["selectedCriteria"]; projectContext: ProjectContext; config: AuditSetConfig; onConfigChange: (config: AuditSetConfig) => void; onToast: (toast: ToastMessage) => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const activeSetId = config.activeSetId;
  const activeSet = auditSets.find((set) => set.id === activeSetId);
  const skillIds = activeSet ? config.skillsBySet[activeSet.id] ?? activeSet.skillIds : [];
  const selectedSkills = skillIds.map((id) => skills.find((skill) => skill.id === id)).filter((skill) => skill !== undefined);
  const prompt = activeSet && showPreview ? buildCombinedAuditPrompt(selectedSkills, inputValues, includedCriteria, projectContext) : null;
  const toggleSkill = (skillId: string) => {
    if (!activeSet) return;
    onConfigChange({ ...config, skillsBySet: { ...config.skillsBySet, [activeSet.id]: skillIds.includes(skillId) ? skillIds.filter((id) => id !== skillId) : [...skillIds, skillId] } });
    setShowPreview(false);
  };
  return <section className="audit-sets-workspace" aria-label="Audit sets"><div className="audit-sets-heading"><div><h2>Audit Sets</h2><p>Combine focused skill reviews into one exportable prompt.</p></div></div>
    <div className="audit-set-options">{auditSets.map((set) => <button key={set.id} className={`audit-set-option${activeSetId === set.id ? " active" : ""}`} aria-pressed={activeSetId === set.id} onClick={() => { onConfigChange({ ...config, activeSetId: set.id }); setShowPreview(false); }}><strong>{set.name}</strong><span>{set.description}</span></button>)}</div>
    {activeSet && <div className="audit-set-config"><div className="audit-set-config-heading"><div><strong>{activeSet.name}</strong><span>{selectedSkills.length} of {activeSet.skillIds.length} selected</span></div><p>Choose which skills to include.</p></div><div className="audit-set-skill-list">{activeSet.skillIds.map((id) => { const skill = skills.find((item) => item.id === id); return skill ? <label key={id}><input type="checkbox" checked={skillIds.includes(id)} onChange={() => toggleSkill(id)} /><span>{skill.name}</span></label> : null; })}</div><button type="button" className="generate-combined-button" disabled={selectedSkills.length === 0} onClick={() => setShowPreview(true)}>Generate Combined Prompt</button>
      {prompt && <div className="combined-prompt-result"><details><summary>Preview combined prompt <span>{prompt.length.toLocaleString()} characters</span></summary><pre>{prompt}</pre></details><button type="button" className="text-action" onClick={() => void copyText(prompt, "prompt", () => undefined, onToast)}>Copy Combined Prompt</button></div>}</div>}
  </section>;
}

function ProjectContextPanel({ value, onChange, onReset }: { value: ProjectContext; onChange: (value: ProjectContext) => void; onReset: () => void }) {
  const fields: { key: keyof ProjectContext; label: string; multiline?: boolean; choices?: string[] }[] = [
    { key: "productName", label: "Product name" }, { key: "productCategory", label: "Product category" }, { key: "industryDomain", label: "Industry / domain" },
    { key: "targetUsers", label: "Target users", multiline: true }, { key: "primaryUserGoal", label: "Primary user goal", multiline: true }, { key: "primaryBusinessGoal", label: "Primary business goal", multiline: true },
    { key: "platform", label: "Platform", choices: ["Web", "iOS", "Android", "Desktop", "Responsive"] }, { key: "userExpertise", label: "User expertise" },
    { key: "designSystem", label: "Design system" }, { key: "technicalConstraints", label: "Technical constraints", multiline: true }, { key: "additionalContext", label: "Additional context", multiline: true },
  ];
  return <section className="project-context-panel" aria-label="Project context"><div className="project-context-heading"><strong>Project context</strong><button className="text-action" type="button" onClick={onReset}>Reset context</button></div><div className="project-context-grid">{fields.map((field) => field.choices
    ? <div className="project-context-field" key={field.key}><span>{field.label}</span><div className="project-platform-options">{field.choices.map((choice) => <label key={choice}><input type="checkbox" aria-label={`${field.label}: ${choice}`} checked={Array.isArray(value.platform) && value.platform.includes(choice)} onChange={() => { const items = Array.isArray(value.platform) ? value.platform : []; onChange({ ...value, platform: items.includes(choice) ? items.filter((item) => item !== choice) : [...items, choice] }); }} />{choice}</label>)}</div></div>
    : <label key={field.key}><span>{field.label}</span>{field.multiline ? <textarea aria-label={field.label} value={String(value[field.key] ?? "")} onChange={(event) => onChange({ ...value, [field.key]: event.target.value })} /> : <input aria-label={field.label} value={String(value[field.key] ?? "")} onChange={(event) => onChange({ ...value, [field.key]: event.target.value })} />}</label>)}</div></section>;
}

function SkillCard({ skill, selected, relevant, dimmed, onClick }: { skill: Skill; selected: boolean; relevant: boolean; dimmed: boolean; onClick: () => void }) {
  return <button className={`skill-card${selected ? " selected" : ""}${relevant ? " relevant" : ""}${dimmed ? " dimmed" : ""}`} onClick={onClick} aria-pressed={selected}>
    <span className="skill-card-top"><span className="skill-group">{skill.group}</span><span className="criteria-count">{skill.criteria.length} criteria</span></span>
    <strong>{skill.name}</strong><span className="skill-description">{skill.shortDescription}</span>
    <span className="scope-tags">{skill.scopes.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</span>
  </button>;
}

function Inspector({ skill, values, projectContext, onInputChange, onResetInputs, includedCriteria, onCriterionToggle, onToast }: { skill: Skill; values: Record<string, string | string[]>; projectContext: ProjectContext; onInputChange: (fieldId: string, value: string | string[]) => void; onResetInputs: () => void; includedCriteria: Record<string, boolean>; onCriterionToggle: (title: string) => void; onToast: (toast: ToastMessage) => void }) {
  const [copied, setCopied] = useState<"prompt" | "criteria" | null>(null);
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
  try { await navigator.clipboard.writeText(value); setCopied(kind); onToast({ tone: "success", text: kind === "prompt" ? "Audit prompt copied" : "Criteria copied" }); }
  catch { setCopied(null); onToast({ tone: "error", text: "Could not copy. Check browser clipboard access and try again." }); }
}

function SkillContextField({ field, value, onChange }: { field: Skill["inputs"][number]; value: string | string[]; onChange: (value: string | string[]) => void }) {
  const controlId = `skill-${field.id}`;
  const label = <span className="context-field-label">{field.label}{field.required && <em>Required</em>}</span>;
  if (field.type === "multiselect") return <fieldset className="skill-context-field"><legend>{label}</legend><div className="multi-input-options">{(field.options ?? []).map((option) => <label key={option}><input type="checkbox" checked={Array.isArray(value) && value.includes(option)} onChange={() => { const current = Array.isArray(value) ? value : []; onChange(current.includes(option) ? current.filter((item) => item !== option) : [...current, option]); }} />{option}</label>)}</div>{field.helperText && <small>{field.helperText}</small>}</fieldset>;
  return <label className="skill-context-field" htmlFor={controlId}>{label}{field.type === "textarea" ? <textarea id={controlId} placeholder={field.placeholder} value={Array.isArray(value) ? value.join("\n") : value} onChange={(event) => onChange(event.target.value)} /> : field.type === "select" ? <select id={controlId} value={Array.isArray(value) ? value[0] ?? "" : value} onChange={(event) => onChange(event.target.value)}><option value="">Choose one</option>{(field.options ?? []).map((option) => <option key={option}>{option}</option>)}</select> : <input id={controlId} type="text" placeholder={field.placeholder} value={Array.isArray(value) ? value.join(", ") : value} onChange={(event) => onChange(event.target.value)} />}{field.helperText && <small>{field.helperText}</small>}</label>;
}

function InspectorSection({ title, children, collapsible = false }: { title: string; children: React.ReactNode; collapsible?: boolean }) {
  return collapsible ? <details className="inspector-section inspector-section-collapsible"><summary>{title}</summary>{children}</details> : <section className="inspector-section"><h3>{title}</h3>{children}</section>;
}
