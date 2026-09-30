import type { ProjectContext } from "./projectContext";

export const STORAGE_KEY = "design_quality_state_v1";

export type SkillValues = Record<string, Record<string, string | string[]>>;
export type CriteriaState = Record<string, Record<string, boolean>>;
export type WorkspaceFilters = {
  query: string;
  group: string;
  stage: string;
  scope: string;
  selectedProblems: string[];
  quickFilter: string | null;
};
export type AuditSetConfig = { activeSetId: string | null; skillsBySet: Record<string, string[]> };
export type DesignQualityState = {
  version: 1;
  projectContext: ProjectContext;
  selectedSkillId: string;
  skillInputs: SkillValues;
  selectedCriteria: CriteriaState;
  filters: WorkspaceFilters;
  theme: "light";
  auditSetConfig: AuditSetConfig;
};

export const defaultDesignQualityState: DesignQualityState = {
  version: 1,
  projectContext: {},
  selectedSkillId: "visual-hierarchy",
  skillInputs: {},
  selectedCriteria: {},
  filters: { query: "", group: "All groups", stage: "All stages", scope: "All scopes", selectedProblems: [], quickFilter: null },
  theme: "light",
  auditSetConfig: { activeSetId: null, skillsBySet: {} },
};

export function loadDesignQualityState(): { state: DesignQualityState; available: boolean; warning?: string } {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { state: defaultDesignQualityState, available: false, warning: "Browser storage is unavailable. Changes will only last for this session." };
  }
  if (!raw) return { state: defaultDesignQualityState, available: true };
  try {
    const parsed = JSON.parse(raw) as Partial<DesignQualityState>;
    const filters = parsed.filters as Partial<DesignQualityState["filters"]> | undefined;
    const auditConfig = parsed.auditSetConfig as Partial<AuditSetConfig> | undefined;
    const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
    const valid = parsed.version === 1 && isRecord(parsed.projectContext) && isRecord(parsed.skillInputs) && isRecord(parsed.selectedCriteria)
      && !!filters && typeof filters.query === "string" && typeof filters.group === "string" && typeof filters.stage === "string" && typeof filters.scope === "string" && Array.isArray(filters.selectedProblems)
      && (filters.quickFilter === null || typeof filters.quickFilter === "string") && !!auditConfig && isRecord(auditConfig.skillsBySet)
      && (auditConfig.activeSetId === null || typeof auditConfig.activeSetId === "string") && typeof parsed.selectedSkillId === "string";
    if (!valid) {
      return { state: defaultDesignQualityState, available: true, warning: "Saved workspace data was from an unsupported version and has been reset." };
    }
    return {
      state: {
        ...defaultDesignQualityState,
        ...parsed,
        filters: { ...defaultDesignQualityState.filters, ...parsed.filters },
        auditSetConfig: { ...defaultDesignQualityState.auditSetConfig, ...parsed.auditSetConfig },
      },
      available: true,
    };
  } catch {
    return { state: defaultDesignQualityState, available: true, warning: "Saved workspace data could not be read and has been reset." };
  }
}

export function saveDesignQualityState(state: DesignQualityState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
