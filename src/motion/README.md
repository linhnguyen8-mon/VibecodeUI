# Motion Library MVP

Eight module boundaries:

1. `presets.ts` — typed single data source, 22 presets and explicit schemas.
2. `MotionPresetGrid.tsx` — responsive cards, selection only.
3. `MotionPreview.tsx` + `playback.ts` + `config.ts` — reusable scenes and Web Animations runtime; viewport autoplay, 1400ms replay pause, hover/replay restart, hidden-tab pause and reduced-motion support.
4. `MotionFilters.tsx` — category AND target filtering with local state.
5. `MotionDetailPanel.tsx` — persistent aside, four sections, close/Escape and focus return.
6. `MotionControls.tsx` + `parameters.ts` — shared parameter registry; intensity modifiers in `config.ts`.
7. `prompt.ts` — pure generator consuming the exact preview config; clipboard UI in panel.
8. `MotionLibraryPage.tsx` + `motion.css` — integration, responsive layout and empty state; mounted from App's Motion tab.

Defaults → intensity changes → subsequent manual edits. Changing intensity recomputes duration/distance/scale from defaults; reset restores all defaults. Switching presets discards the prior draft and keeps the aside mounted. Spring is a dependency-free CSS easing approximation, not a physics simulation.

Add a preset using an existing behavior/scene without touching components. Adding a new motion behavior requires one engine case; adding a new parameter requires a registry entry and engine/prompt support.

Verification: `motion.test.ts` checks data contracts, filter intersections, intensity precedence and preview/prompt consistency. `playback.test.ts` checks replay cadence, viewport entry/exit, cleanup, reduced-motion changes and hidden-tab pause. Browser responsive checks passed at 390px (one column) and 800px (two columns), without horizontal overflow. Browser acceptance: Overlay → Scale In → duration 450ms → scale .92 → Copy Prompt → category All → Button Press → Escape. Preview loops are demonstrations; generated prompts retain the preset's production trigger.

Scope excludes timeline, editable keyframes, custom presets, favorites, export and framework selection.

Final polish: intensity values align with slider steps; toggle tracks adapt to travel distance. Scale labels describe exit, press and pulse behavior. Prompts target the preview component, while supported targets remain filter metadata. Pending clipboard completions cannot mark a newer prompt as copied.

Intensity uses three native radio stops (Subtle / Normal / Expressive), with arrow-key navigation. Range controls announce units via aria-valuetext; select and switch controls have explicit accessible names. Closing a filtered-out preset restores focus to the active category filter.

## Apple motion reference

Reference: Apple WWDC23, Animate with springs — https://developer.apple.com/videos/play/wwdc2023/10158/

Spatial entrances and toggles use a damped spring from rest, sampled into 121 Web Animations keyframes. Default Bounce is 0%; success/badge pops use 15%, adjustable up to 30%. Duration defines perceptual pacing; total playback includes a settling tail and is exported in the prompt. These web defaults and damping mapping are our implementation choices, not Apple's native spring implementation.

Removed the separate Settling control: Duration and Bounce define spring character. Bounce 0 uses a critically damped response; nonzero bounce uses an underdamped response. Opacity clamps the spatial progress to 0–1. Exit/fade/pulse use smooth timing without spring bounce. Loading loops retain continuous linear timing. Hold and Repeat pause remain for their respective behaviors.

The preset preview is a replay from rest, not an interactive gesture engine. It does not reproduce native velocity-preserving retargeting. Generated prompts ask implementations to stay interruptible without blocking user actions.
