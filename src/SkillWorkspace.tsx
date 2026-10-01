import { Pencil, Target, Fingerprint, Network, Route, Layers, Undo2, Brain, ListTree, LayoutDashboard, PanelsTopLeft, Sparkles, Component, Accessibility, ShieldCheck, MonitorSmartphone, Lightbulb, BriefcaseBusiness, ChartNoAxesCombined, MousePointerClick, Footprints, ArrowLeftRight, Activity, ClipboardCheck, ScanEye, Gauge, Hexagon, Scale, Shapes, Eye, Users, MapPin, type LucideIcon } from "lucide-react";
import { PopoverDetails } from "./PopoverDetails";
import { createContext, useContext, useMemo, useState } from "react";
import { skills, type Skill } from "./skills";
import { principles, slopSignals } from "./knowledge";
import { buildAuditPrompt, buildCriteriaOnly } from "./promptBuilder";
import { type CriterionReview, type DesignQualityState } from "./persistence";
import { translateAudit, translatedSummaries } from "./skillLanguage";
import "./skills.css";
const LanguageContext = createContext<"en" | "vi">("vi");
function useTranslate() { const language = useContext(LanguageContext); return (text: string) => translateAudit(text, language); }

type ToastMessage = { tone: "success" | "error" | "info"; text: string };
type Props = { query: string; onQueryChange: (value: string) => void; state: DesignQualityState; onStateChange: (update: (current: DesignQualityState) => DesignQualityState) => void; storageWarning: string; onToast: (toast: ToastMessage) => void };

export function SkillWorkspace({ query, onQueryChange, state, onStateChange, storageWarning, onToast }: Props) {
  const [language, setLanguage] = useState<"en" | "vi">(() => { try { return localStorage.getItem("skills-language") === "en" ? "en" : "vi"; } catch { return "vi"; } });
  const t = (text: string) => translateAudit(text, language);
  const { filters } = state;
  const groups = [...new Set(skills.map((skill) => skill.group))];
  const problems = [...new Set(skills.flatMap((skill) => skill.problems))];
  const quickFilters: Record<string, string[]> = {
    "Looks generic": ["purpose-fit", "content-truth", "ai-visual-slop"],
    "Hard to understand": ["heuristic-sweep", "ia-labels", "cognitive-load"],
    "Hard to navigate": ["ia-labels", "task-flow", "flow-completeness"],
    "Too cluttered": ["cognitive-load", "visual-hierarchy", "ai-visual-slop"],
    "Too empty": ["purpose-fit", "visual-hierarchy", "state-recovery"],
    "Flow feels awkward": ["task-flow", "flow-completeness", "state-recovery"],
    "Missing states": ["flow-completeness", "state-recovery"],
    "UI inconsistent": ["design-system", "ia-labels", "heuristic-sweep"],
    "Doesn't feel trustworthy": ["purpose-fit", "content-truth", "state-recovery", "accessibility"],
  };
  const patchFilters = (patch: Partial<DesignQualityState["filters"]>) => onStateChange((current) => ({ ...current, filters: { ...current.filters, ...patch } }));
  const visible = useMemo(() => skills.filter((skill) => {
    const matchesQuery = `${skill.name} ${t(skill.name)} ${skill.shortDescription} ${skill.cardEN} ${skill.group} ${t(skill.group)} ${skill.detects.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const matchesProblems = filters.selectedProblems.length === 0 || filters.selectedProblems.some((problem) => skill.problems.includes(problem));
    const matchesIssue = !filters.quickFilter || (quickFilters[filters.quickFilter] ?? []).includes(skill.id);
    return matchesQuery && matchesProblems && matchesIssue;
  }), [query, filters, language]);
  const selected = visible.find((skill) => skill.id === state.selectedSkillId) ?? visible[0];
  const registryIssues = skills.flatMap((skill, index) => {
    const issues: string[] = [];
    if (!skill.id?.trim() || !skill.name?.trim() || !skill.group?.trim()) issues.push(`Skill registry entry ${index + 1} is missing an ID, name, or group.`);
    if (!Array.isArray(skill.criteria) || !Array.isArray(skill.scopes) || !Array.isArray(skill.stages)) issues.push(`${skill.name || `Entry ${index + 1}`} has incomplete registry data.`);
    return issues;
  });
  return <LanguageContext.Provider value={language}><section lang={language} className="skills-workspace" aria-label="Design quality skills">
    {storageWarning && <div className="workspace-notice" role="status">{storageWarning}</div>}
    {registryIssues.length > 0 && <div className="workspace-notice error" role="alert">Some skill registry entries are invalid: {registryIssues.join(" ")}</div>}
    <div className="skills-control-row">
      <PopoverDetails className="compact-filter"><summary>{t("Problem")}{filters.selectedProblems.length > 0 && <span className="filter-badge">{filters.selectedProblems.length}</span>}</summary><div className="skills-control-popover">
        <button type="button" className="text-action problem-clear-all" disabled={filters.selectedProblems.length === 0} onClick={() => patchFilters({ selectedProblems: [] })}>{t("Clear all")}</button>
        <fieldset><legend>{t("Problem")}</legend>{problems.map(problem => <label className="compact-problem" key={problem}><input type="checkbox" checked={filters.selectedProblems.includes(problem)} onChange={() => patchFilters({ selectedProblems: filters.selectedProblems.includes(problem) ? filters.selectedProblems.filter(item => item !== problem) : [...filters.selectedProblems, problem] })} />{t(problem)}</label>)}</fieldset>
      </div></PopoverDetails>
      <label className="compact-quick-filter"><span>{t("What feels wrong?")}</span><select aria-label="What feels wrong?" value={filters.quickFilter ?? ""} onChange={e => patchFilters({ quickFilter: e.target.value || null })}><option value="">{t("All issues")}</option>{Object.keys(quickFilters).map(item => <option key={item} value={item}>{t(item)}</option>)}</select></label>
<div className="skills-results" aria-live="polite"><div className="skills-language" role="group" aria-label="Language"><button type="button" aria-pressed={language === "vi"} onClick={() => { setLanguage("vi"); try { localStorage.setItem("skills-language", "vi"); } catch {} }}>VI</button><button type="button" aria-pressed={language === "en"} onClick={() => { setLanguage("en"); try { localStorage.setItem("skills-language", "en"); } catch {} }}>EN</button></div><strong>{visible.length} {t("skills")}</strong><span>{t("Choose a skill to inspect its criteria")}</span>{(query || filters.selectedProblems.length || filters.quickFilter) ? <button className="text-action" type="button" onClick={() => { onQueryChange(""); onStateChange(current => ({ ...current, filters: { ...current.filters, query: "", group: "All groups", stage: "All stages", scope: "All scopes", selectedProblems: [], quickFilter: null }, auditSetConfig: { ...current.auditSetConfig, activeSetId: null } })); }}>{t("Clear filters")}</button> : null}</div>
    </div>
    <div className="skills-split">
      <div className="skills-browser" aria-label="Skill browser">

        {visible.length ? <div className="skills-grouped-list">{groups.map((group, index) => {
          const items = visible.filter(skill => skill.group === group);
          return items.length ? <section className="skills-list-group" key={group} aria-labelledby={`skill-group-${index}`}><h2 id={`skill-group-${index}`}>{t(group)}<span>{items.length}</span></h2><ul className="skills-card-row">{items.map(skill => <li key={skill.id}><SkillCard skill={skill} selected={skill.id === selected?.id} onClick={() => onStateChange(current => ({ ...current, selectedSkillId: skill.id }))} /></li>)}</ul></section> : null;
        })}</div> : <div className="skills-empty">No skills match these filters. Try another search or filter.</div>}
      </div>
      <aside className="skill-inspector" aria-label="Skill workspace">
        {selected ? <Inspector reviews={state.criterionReviews[selected.id] ?? {}} onReviewChange={(title, patch) => onStateChange(current => ({ ...current, criterionReviews: { ...current.criterionReviews, [selected.id]: { ...current.criterionReviews[selected.id], [title]: { ...(current.criterionReviews[selected.id]?.[title] ?? { checked: false, status: "", note: "" }), ...patch } } } }))} key={selected.id} skill={selected} values={state.skillInputs[selected.id] ?? {}} includedCriteria={state.selectedCriteria[selected.id] ?? {}} onCriterionToggle={(title) => onStateChange((current) => ({ ...current, selectedCriteria: { ...current.selectedCriteria, [selected.id]: { ...current.selectedCriteria[selected.id], [title]: !(current.selectedCriteria[selected.id]?.[title] ?? true) } } }))} onToast={onToast} /> : <div className="inspector-empty">Select a skill to inspect its criteria.</div>}
      </aside>
    </div>
  </section></LanguageContext.Provider>;
}

const skillGroupColors: Record<Skill["group"], string> = {
  Triage: "product", Flow: "flow", Content: "cognitive", Visual: "visual", Build: "accessibility",
};
const skillIcons: Record<string, LucideIcon> = {
  "heuristic-sweep": ClipboardCheck, "purpose-fit": Target, "task-flow": Route,
  "flow-completeness": Network, "state-recovery": Undo2, "ia-labels": ListTree,
  "content-truth": ShieldCheck, "cognitive-load": Brain, "visual-hierarchy": ScanEye,
  "ai-visual-slop": Sparkles, "design-system": Component, responsive: MonitorSmartphone,
  accessibility: Accessibility,
};
const skillSummaries = Object.fromEntries(skills.map(skill => [skill.id, skill.shortDescription]));

function SkillCard({ skill, selected, onClick }: { skill: Skill; selected: boolean; onClick: () => void }) {
  const t = useTranslate();
  const language = useContext(LanguageContext);
  const Icon = skillIcons[skill.id] ?? LayoutDashboard;
  return <button type="button" className={`skill-card skill-group-${skillGroupColors[skill.group]}${selected ? " selected" : ""}`} onClick={onClick} aria-pressed={selected}>
    <Icon className="skill-card-icon" size={24} strokeWidth={1.7} aria-hidden="true" />
    <strong>{t(skill.name)}</strong>
    <span className="skill-description">{language === "vi" ? skillSummaries[skill.id] ?? t(skill.shortDescription) : translatedSummaries[skill.id] ?? t(skill.shortDescription)}</span>
  </button>;
}

function Inspector({ reviews, onReviewChange, skill, values, onInputChange, onResetInputs, onToast }: { reviews: Record<string, CriterionReview>; onReviewChange: (title: string, patch: Partial<CriterionReview>) => void; skill: Skill; values: Record<string, string | string[]>; includedCriteria: Record<string, boolean>; onCriterionToggle: (title: string) => void; onToast: (toast: ToastMessage) => void }) {
  const t = useTranslate();
  const [copied, setCopied] = useState<"prompt" | "criteria" | null>(null);
  const [editingCriteria, setEditingCriteria] = useState<Record<string, boolean>>({});
  const prompt = buildAuditPrompt(skill, values, {}, {}, noteOnlyReviews({ [skill.id]: reviews })[skill.id]);
  const criteriaOnly = buildCriteriaOnly(skill, {});
  const linkedPrinciples = skill.principleIds.map((id) => principles.find((item) => item.id === id)).filter((item) => item !== undefined);
  const linkedSlopSignals = skill.slopSignalIds.map((id) => slopSignals.find((item) => item.id === id)).filter((item) => item !== undefined);
  return <><div className="inspector-content" key={skill.id}>
    <div className="inspector-heading"><span className="skills-eyebrow">SKILL WORKSPACE</span><h2>{t(skill.name)}</h2></div>
    <InspectorSection title="Purpose"><p>{useContext(LanguageContext) === "vi" ? skillSummaries[skill.id] ?? t(skill.shortDescription) : translatedSummaries[skill.id] ?? t(skill.shortDescription)}</p></InspectorSection>
    <InspectorSection title="Detects"><ul>{skill.detects.map((item) => <li key={item}>{t(item)}</li>)}</ul></InspectorSection>
    <InspectorSection title="When to use"><p>{t(skill.whenToUse)}</p></InspectorSection>
    <InspectorSection title="Audit checklist">
      {skill.id === "heuristic-sweep" && <p className="criteria-hint">{t("Run this first. Use findings to choose a recommended deep-dive.")}</p>}
      {skill.id === "task-flow" && <p className="criteria-hint">{t("Apply criteria 2–4 at every step; record each failed step.")}</p>}
      {skill.id === "accessibility" && <p className="criteria-hint">{t("Screenshots cannot verify exact contrast or keyboard behavior. Mark criteria 1 and 4 as review until verified with tools and manual testing.")}</p>}

      <ol className="audit-checklist">{skill.criteria.map((criterion) => {
        const review = reviews[criterion.id] ?? { checked: false, status: "", note: "" };
        return <li key={criterion.title} className={`audit-checklist-item${editingCriteria[criterion.id] ? " is-editing" : ""}`}>
          <div className="criterion-copy"><strong>{t(criterion.title)}</strong>{criterion.description && <span title={t(criterion.description)}>{t(criterion.description)}</span>}</div>
          <button type="button" className="criterion-edit" aria-label={`${editingCriteria[criterion.id] ? 'Close editor' : 'Edit'}: ${t(criterion.title)}`} title={editingCriteria[criterion.id] ? 'Close editor' : 'Edit'} aria-expanded={!!editingCriteria[criterion.id]} aria-controls={`criterion-editor-${criterion.id}`} onClick={() => setEditingCriteria(current => ({ ...current, [criterion.id]: !current[criterion.id] }))}><Pencil size={14} aria-hidden="true" /></button>
          {editingCriteria[criterion.id] && <div className="criterion-editor" id={`criterion-editor-${criterion.id}`}>
          <textarea className="criterion-note-input" aria-label={`Notes: ${criterion.title}`} placeholder={t("Notes / findings…")} rows={2} value={review.note} onChange={e => onReviewChange(criterion.id, { note: e.target.value })} />
          </div>}
        </li>;
      })}</ol>
    </InspectorSection>
    {linkedSlopSignals.length > 0 && <InspectorSection title="AI slop signals" collapsible><ul className="knowledge-list">{linkedSlopSignals.map((signal) => <li key={signal.id}><strong>{signal.name}</strong><span>{signal.description}</span></li>)}</ul></InspectorSection>}
    <InspectorSection title="Design principles" collapsible><ul className="knowledge-list">{linkedPrinciples.map((principle) => <li key={principle.id}><strong>{principle.name}</strong><span>{principle.statement}</span></li>)}</ul></InspectorSection>
    <section className="inspector-section prompt-builder-section"><h3>{t("Generated Prompt")}</h3><details className="generated-prompt"><summary>Preview prompt <span>{prompt.length.toLocaleString()} characters</span></summary><pre>{prompt}</pre></details></section>
  </div><div className="prompt-actions"><button type="button" className="copy-prompt-button" onClick={() => void copyText(prompt, "prompt", setCopied, onToast)}>{copied === "prompt" ? t("Copied") : t("Copy Audit Prompt")}</button><button type="button" className="text-action" onClick={() => void copyText(criteriaOnly, "criteria", setCopied, onToast)}>{copied === "criteria" ? t("Criteria copied") : t("Copy Criteria Only")}</button></div></>;
}

async function copyText(value: string, kind: "prompt" | "criteria", setCopied: (kind: "prompt" | "criteria" | null) => void, onToast: (toast: ToastMessage) => void) {
  try { await navigator.clipboard.writeText(value); setCopied(kind); onToast({ tone: "success", text: kind === "prompt" ? "Audit prompt copied" : "Criteria copied" }); }
  catch { setCopied(null); onToast({ tone: "error", text: "Could not copy. Check browser clipboard access and try again." }); }
}

function InspectorSection({ title, children, collapsible = false }: { title: string; children: React.ReactNode; collapsible?: boolean }) {
  const t = useTranslate();
  return collapsible ? <details className="inspector-section inspector-section-collapsible"><summary>{t(title)}</summary>{children}</details> : <section className="inspector-section"><h3>{t(title)}</h3>{children}</section>;
}

// Old stored review flags must not silently exclude criteria or imply a manual assessment.
function noteOnlyReviews(reviews: DesignQualityState["criterionReviews"]): DesignQualityState["criterionReviews"] {
  return Object.fromEntries(Object.entries(reviews).map(([skillId, criteria]) => [skillId, Object.fromEntries(Object.entries(criteria).map(([criterionId, review]) => [criterionId, { checked: false, status: "", note: review.note }]))]));
}
