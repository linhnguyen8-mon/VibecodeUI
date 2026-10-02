1. Project Mission
This project is a visual Design System library for inspecting, editing, previewing, and exporting reusable design-system presets.
The agent's job is to keep the system:
- accurate,
- internally consistent,
- easy to extend with new Design System presets,
- visually verifiable,
- minimal in implementation,
- and reliable for prompt generation.
The product is NOT a general-purpose design tool.
Do not add unrelated features, workflows, panels, abstractions, or settings unless they are necessary to solve the current problem.
2. Core Product Principle
A Design System preset has ONE source of truth.
Every editable Design System value must stay synchronized across:
1. Preset data
2. Design tokens
3. Sidebar controls
4. Preview UI
5. Generated prompt/export output
The same value must never be independently duplicated across these layers.
Expected flow:
Preset data
→ normalized design tokens
→ sidebar controls
→ live preview
→ generated prompt
When the user edits a value:
Sidebar edit
→ update source-of-truth state
→ update tokens
→ update preview immediately
→ update generated prompt immediately
If any one of these surfaces shows a different value, treat it as a bug.
3. Design System Preset Ingestion
The user may paste or provide Design Systems from different sources.
The agent must convert them into the project's canonical preset format.
Required behavior
When adding a new Design System preset:
1. Read the complete source.
2. Extract only explicitly supported design-system information.
3. Preserve exact values whenever the source provides exact values.
4. Never invent missing numeric values and present them as source data.
5. Normalize naming into the project's canonical token schema.
6. Map imported values to reusable tokens.
7. Connect those tokens to sidebar controls.
8. Connect those tokens to preview rendering.
9. Connect those tokens to prompt generation.
10. Verify all four surfaces remain consistent.
Accuracy rule
If the source says:
- radius = 12px
- primary = #4F46E5
- spacing = 16px
- body size = 14px
- line height = 20px
then those exact values must propagate into:
- preset data,
- tokens,
- controls,
- preview,
- generated prompt.
Do not silently round, approximate, replace, or reinterpret the value.
Missing values
If a source does not specify a value:
Preferred order:
1. Keep the field unset if the product supports unset values.
2. Derive only when a deterministic existing project rule exists.
3. Use an existing project default only when required by the renderer.
Never imply that an inferred/default value came from the imported Design System.
4. Canonical Token Model
All presets must resolve into a canonical token model before being rendered.
Prefer semantic tokens over scattered raw values.
Example structure:
designSystem = {
  color: {
    brand: {},
    surface: {},
    content: {},
    border: {},
    functional: {}
  },

  typography: {
    fontFamily: {},
    scale: {},
    roles: {}
  },

  layout: {
    spacing: {},
    gutter: {},
    margin: {},
    radius: {},
    elevation: {},
    cardPadding: {}
  },

  motion: {},

  component: {}
}
The actual repository schema takes precedence over this example.
Token rule
Before adding a new token:
- search for an existing equivalent token,
- reuse it if semantics match,
- avoid aliases that represent the same concept,
- avoid adding one-off tokens for a single preset unless necessary.
Do not create parallel token systems.
5. Single Source of Truth
Never hardcode the same Design System value separately in:
- preset files,
- UI components,
- CSS,
- preview fixtures,
- prompt templates.
A visual value should come from one canonical state/token.
Bad:
sidebarRadius = 12
previewRadius = 12
promptRadius = 12
Good:
tokens.radius.card = 12
Then:
Sidebar ─┐
Preview ─┼→ tokens.radius.card
Prompt  ─┘
Whenever duplication is discovered, prefer fixing the data flow instead of patching each output independently.
6. Sidebar Editing Rules
Sidebar controls are editors for the canonical Design System state.
They are not independent UI-only settings.
For every editable field:
- display the current canonical value,
- update canonical state on change,
- propagate changes to preview,
- propagate changes to generated prompt,
- preserve valid units and types,
- prevent accidental desynchronization.
Required interaction
When a user changes a sidebar value:
onChange
→ validate
→ update design-system state
→ regenerate dependent tokens
→ rerender preview
→ regenerate prompt
The visible preview should update immediately unless an existing intentional debounce strategy already exists.
Do not add an Apply button unless the current product explicitly requires one.
7. Preview Rules
The preview is a representation of the current Design System state.
It must not maintain its own styling configuration.
Preview must:
- consume canonical tokens,
- reflect current sidebar values,
- update live,
- expose meaningful visual differences between presets,
- avoid demo-specific hardcoded styling that overrides the DS.
Preview must not:
- contain duplicated DS constants,
- silently override tokens,
- depend on values unavailable to the prompt generator,
- fake support for a token that is not actually connected.
If a control changes but preview does not visibly respond, trace the entire state → token → style path.
Do not patch the preview locally unless the root cause is local.
8. Prompt Generation Rules
Generated prompts are a deterministic representation of the current Design System state.
The prompt must describe what the user is currently seeing, not the original preset before editing.
Therefore:
Current state
→ tokens
→ prompt
NOT:
Original preset
→ static prompt text
Prompt requirements
Generated prompts must:
- use current values,
- include relevant token values,
- preserve units,
- reflect sidebar modifications,
- exclude obsolete values,
- avoid contradictory instructions,
- remain concise enough for practical AI use,
- contain enough detail to recreate the visual system.
When a DS value changes in the sidebar, the prompt must update automatically.
Avoid prose duplication
Do not manually write separate prompt descriptions for every preset if the same information can be generated from tokens.
Prefer:
generateDesignSystemPrompt(tokens)
over:
presetA.prompt = "..."
presetB.prompt = "..."
presetC.prompt = "..."
unless preset-specific contextual information genuinely cannot be derived from tokens.
9. Preset Architecture
A preset should primarily contain data, not implementation logic.
Preferred:
preset
→ normalized data
→ shared renderer
→ shared controls
→ shared prompt generator
Avoid:
preset A → custom renderer A
preset B → custom renderer B
preset C → custom renderer C
unless a preset contains a genuinely unsupported structural concept.
New presets should usually require:
- adding data,
- mapping unsupported source terminology,
- at most extending the shared token model.
They should NOT require rebuilding the UI.
10. Minimal Solution Rule
Always solve the smallest real problem.
Before adding:
- a component,
- hook,
- utility,
- service,
- abstraction,
- dependency,
- panel,
- setting,
- mode,
- config field,
ask:
Can this problem be solved cleanly using the existing architecture?

If yes, use the existing architecture.
Do not
- add speculative features,
- create "future-proof" abstractions without current need,
- add configuration for one fixed behavior,
- create extra UI controls without user request,
- add state layers that duplicate existing state,
- refactor unrelated modules while fixing one bug,
- introduce new dependencies for trivial logic.
Prefer a 20-line clear fix over a 200-line generalized framework when both solve the current requirement.
11. Enhancement Rule
Enhancement means increasing quality, consistency, clarity, or extensibility without increasing product complexity unnecessarily.
Enhance in this priority order:
1. Fix incorrect behavior
2. Fix data inconsistency
3. Remove duplicated sources of truth
4. Improve token mapping
5. Improve live synchronization
6. Improve prompt accuracy
7. Improve preview fidelity
8. Improve maintainability
9. Only then consider new capability
Do not interpret "enhance" as "add more features".
12. Investigation Before Modification
Before editing code:
1. Inspect repository structure.
2. Find current Design System state/store.
3. Find preset schema.
4. Find token-generation logic.
5. Find sidebar control bindings.
6. Find preview styling path.
7. Find prompt-generation logic.
8. Trace one existing preset end-to-end.
9. Identify duplication or broken synchronization.
10. Modify the smallest correct layer.
Never patch blindly from the visible UI.
13. Root-Cause Rule
For bugs such as:
- sidebar changes but preview does not update,
- preview changes but prompt remains stale,
- preset loads wrong values,
- prompt contains old values,
- token and control values differ,
trace this pipeline:
Source preset
↓
Normalization
↓
State/store
↓
Tokens
↓
├─ Sidebar
├─ Preview
└─ Prompt generator
Find the first stage where the expected value diverges.
Fix that stage.
Do not independently patch all downstream outputs.
14. Import Normalization Rules
Different Design Systems may use different terminology.
Examples:
primary / brand / accent
surface / background / canvas
foreground / text / content
corner-radius / radius / border-radius
space / spacing / gap
shadow / elevation
Map source terminology into the project's canonical vocabulary.
Keep optional source metadata when useful, but rendering must depend on canonical tokens.
Mapping rule
Source-specific naming belongs in import/normalization logic.
It should not leak into:
- generic sidebar components,
- generic preview components,
- generic prompt generators.
15. Numeric and Unit Integrity
Preserve numbers and units correctly.
Examples:
16px ≠ 16rem
1.5 ≠ 150%
400 ≠ Medium
#FFFFFF ≠ rgba(255,255,255,0.9)
Do not transform values unless transformation is required by the internal representation.
When conversion is required:
- make it deterministic,
- preserve semantic equivalence,
- test the conversion.
For adjustable numeric controls, define:
- type,
- unit,
- valid range,
- step,
- normalization behavior.
Do not guess hidden conversion rules.
16. Visual Fidelity Rule
The preview should visually demonstrate the tokens that the user can edit.
If a user edits:
- primary color → relevant branded elements must respond,
- surface color → visible surfaces must respond,
- content color → text must respond,
- radius → relevant components must respond,
- spacing → layout must respond,
- typography → visible type roles must respond,
- elevation → supported surfaces must respond.
Do not connect controls to invisible or meaningless demo values.
17. Schema Evolution Rule
Only extend the canonical Design System schema when an imported DS contains an important concept that:
1. cannot be represented accurately by existing tokens,
2. materially affects the design,
3. is reusable across presets.
Before schema extension:
- search current schema,
- search existing aliases,
- search preview usage,
- search prompt usage.
If a new field is added, connect it end-to-end:
schema
→ default/normalization
→ state
→ sidebar
→ preview
→ prompt
→ test
A half-connected token is not considered implemented.
18. No Silent Feature Expansion
Do not turn a task like:
support a new typography scale

into:
- typography analytics,
- font upload,
- variable font editor,
- comparison mode,
- history,
- favorites,
- export manager.
Implement only what is required for the existing product goal.
When you notice a possible future improvement:
- do not implement it automatically,
- mention it only if it materially affects the current solution.
18A. Build the Requested Interface
When a task asks to build or implement a product interface, the required deliverable is a working user-facing interface implemented in the project's codebase.
- Do not substitute a Design System editor, prompt customizer, prompt generator, design preview, screenshot, Figma link, or documentation for the requested product interface.
- Do not make editing the generated prompt or design tokens the main user workflow unless the user explicitly asks for a Design System editing product.
- Prompt generation and Design System customization may support implementation, but they do not count as implementing the requested interface.
- Inspect the existing app and implement the requested screens, interactions, responsive behavior, and relevant states using the current architecture.
- Figma access has been authorized for this project. When Figma references are provided and the connected Figma capability is available, inspect the source frames and assets directly; treat them as implementation references, not as the final deliverable. Do not ask the user to manually retrieve accessible Figma content.
- If Figma access is unavailable in the current runtime, state that limitation and continue implementation from provided references and project context; never replace implementation with Figma links.
19. Testing Requirements
Every Design System change must verify synchronization.
At minimum test:
Preset loading
preset
→ canonical state
Sidebar synchronization
state
→ controls
Editing
control change
→ state
→ tokens
Preview synchronization
tokens
→ preview
Prompt synchronization
tokens
→ prompt
Regression
Existing presets must continue to render correctly.
20. Required Synchronization Test
For at least one editable value in each affected category:
1. Load preset.
2. Record initial value.
3. Change value from sidebar.
4. Confirm state changed.
5. Confirm token changed.
6. Confirm preview changed.
7. Confirm generated prompt contains the new value.
8. Confirm old value is no longer incorrectly used.
9. Reload/switch preset if persistence behavior exists.
10. Confirm no unrelated token changed.
Categories when applicable:
- Color
- Typography
- Layout
- Radius
- Elevation
- Motion
- Component-specific tokens
21. Regression Safety
Before considering work complete:
- run existing tests,
- run build/typecheck/lint if configured,
- test at least one existing preset,
- test the newly changed/imported preset,
- verify sidebar → preview,
- verify sidebar → prompt,
- verify no obvious visual regression.
If the repository provides screenshots or fixture presets, use them.
22. Agent Autonomy
The agent should independently:
- inspect the repository,
- understand the current architecture,
- trace data flow,
- modify code,
- run commands,
- fix encountered errors,
- test the result,
- iterate until relevant checks pass.
Do not ask the user to:
- manually inspect code that the agent can inspect,
- manually run tests that the agent can run,
- manually compare values that can be verified programmatically.
Ask the user only when required information or runtime access genuinely does not exist.
23. Decision Priority
When multiple implementations are possible, choose using this order:
1. Correctness
2. Single source of truth
3. Existing architecture compatibility
4. Simplicity
5. Visual fidelity
6. Testability
7. Extensibility
8. Code cleverness
Do not sacrifice simplicity for theoretical extensibility.
24. Refactoring Rule
Refactor only when it directly improves the current task.
Good reasons:
- duplicate token source causes desynchronization,
- preset logic is duplicated,
- prompt generator reads stale data,
- preview bypasses canonical state.
Bad reasons:
- "this file could be cleaner",
- preference for another architecture,
- speculative future scaling.
Preserve stable behavior.
25. Definition of Done
A Design System-related task is complete only when:
- [ ] Source values were interpreted accurately
- [ ] Preset is normalized to canonical tokens
- [ ] No unnecessary duplicate source of truth was introduced
- [ ] Sidebar shows correct values
- [ ] Sidebar edits update canonical state
- [ ] Preview updates from the edited values
- [ ] Generated prompt updates from the edited values
- [ ] Units and numeric values remain correct
- [ ] Existing presets still work
- [ ] Relevant tests/build checks pass
- [ ] No unrelated feature was added
- [ ] When the request asks for a product interface, the actual user-facing interface is implemented; Figma references, prompt editing, and documentation are not used as substitutes
- [ ] Remaining limitations are explicitly stated
26. Final Response Format
After implementation, respond using:
Changed
Briefly list what was changed.
Data flow
State how the affected data now flows:
preset → tokens → sidebar → preview → prompt
Verified
List tests/checks actually executed.
Result
State whether:
- build passes,
- relevant tests pass,
- sidebar synchronization passes,
- preview synchronization passes,
- prompt synchronization passes.
Remaining limitations
Only mention limitations that genuinely could not be verified.
Do not list speculative future work unless it blocks the current requirement.
27. Golden Rule
For every Design System value, there should be one authoritative value and multiple consumers.
                   ┌→ Sidebar
Preset → Tokens ───┼→ Preview
                   └→ Prompt
Never allow:
Preset → Sidebar value A
Preset → Preview value B
Preset → Prompt value C
Accuracy and synchronization are more important than adding more capabilities.
Keep the system small, predictable, and easy to extend.
