import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultDesignQualityState, loadDesignQualityState, saveDesignQualityState, STORAGE_KEY } from "./persistence";

function createStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key: string, next: string) => { value = next; }),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("design quality workspace persistence", () => {
  it("loads a fresh versioned workspace when storage is empty", () => {
    vi.stubGlobal("window", { localStorage: createStorage() });
    expect(loadDesignQualityState()).toEqual({ state: defaultDesignQualityState, available: true });
  });

  it("round trips project context, selection, filters, skill data, and audit choices", () => {
    const storage = createStorage();
    vi.stubGlobal("window", { localStorage: storage });
    const state = {
      ...defaultDesignQualityState,
      projectContext: { productName: "Sample" },
      selectedSkillId: "task-flow",
      skillInputs: { "task-flow": { task: "Transfer" } },
      selectedCriteria: { "task-flow": { "Task is clear": false } },
      filters: { ...defaultDesignQualityState.filters, group: "Information & Flow" },
      auditSetConfig: { activeSetId: "pre-ship-review", skillsBySet: { "pre-ship-review": ["task-flow"] } },
    };
    saveDesignQualityState(state);
    expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(state));
    expect(loadDesignQualityState().state).toEqual(state);
  });

  it("resets malformed or unsupported saved data with a warning", () => {
    vi.stubGlobal("window", { localStorage: createStorage('{"version":99}') });
    expect(loadDesignQualityState()).toMatchObject({ state: defaultDesignQualityState, available: true, warning: expect.any(String) });
  });

  it("reports unavailable browser storage without throwing", () => {
    vi.stubGlobal("window", { get localStorage() { throw new Error("blocked"); } });
    expect(loadDesignQualityState()).toMatchObject({ state: defaultDesignQualityState, available: false, warning: expect.any(String) });
  });
});
