import { describe, expect, it } from "vitest";
import { loadMockLibraryData } from "../data/libraryData";
import { createAnimationPrompt, createDesignSystemPrompt, getAllResources, searchResources } from "./library";
import { getLayout } from "./layout";
import { tokenValue } from "./tokens";

describe("library fixtures", () => {
  const data = loadMockLibraryData();

  it("loads stable mock data with unique ids", () => {
    const ids = getAllResources(data).map((resource) => resource.id);
    expect(data.designSystems).toHaveLength(3);
    expect(data.components).toHaveLength(8);
    expect(data.animations).toHaveLength(6);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("searches case-insensitively by names and tags", () => {
    expect(searchResources(data, "BUTTON").map((item) => item.id)).toContain("component-primary-button");
    expect(searchResources(data, "dialog").map((item) => item.id)).toContain("animation-dialog-enter");
    expect(searchResources(data, "finance").map((item) => item.id)).toContain("ds-fintech-calm");
  });

  it("includes current design system token values in generated prompt", () => {
    const ds = structuredClone(data.designSystems[0]);
    ds.tokens[0].value = "#123456";
    expect(createDesignSystemPrompt(ds)).toContain("color.brand.primary: #123456");
  });

  it("always includes reduced motion in animation prompts", () => {
    const prompt = createAnimationPrompt(data.animations[0]);
    expect(prompt.toLowerCase()).toContain("prefers-reduced-motion");
  });

  it("exports the visible fallback status colors without duplicating overrides", () => {
    const ds = structuredClone(data.designSystems[0]);
    ds.tokens[0].value = "#123456";
    ds.tokens.find(token => token.name === "color.status.success")!.value = "#abcdef";
    const prompt = createDesignSystemPrompt(ds);
    expect(prompt).toContain("color.status.info: #2457C5");
    expect(prompt).toContain("color.status.warning: #D97706");
    expect(prompt).toContain("color.status.success: #abcdef");
    expect(prompt.match(/color.status.success:/g)).toHaveLength(1);
  });

  it("includes the complete semantic color set in the selected design system prompt", () => {
    const ds = data.designSystems[0];
    const prompt = createDesignSystemPrompt(ds);
    for (const name of [
      "color.brand.primary", "color.brand.secondary", "color.surface.default", "color.surface.soft",
      "color.surface.tertiary", "color.status.success", "color.status.warning", "color.status.danger",
      "color.status.info", "color.text.primary", "color.text.secondary", "color.text.disabled",
      "color.text.on-color", "color.text.link", "color.background.page", "color.surface.elevated",
      "color.interactive.default", "color.interactive.hover", "color.interactive.active",
      "color.interactive.focus", "color.interactive.disabled", "color.focus.ring", "color.overlay.scrim",
      "color.border.default", "color.border.divider", "color.border.selected", "color.border.hover",
      "color.border.focus", "color.border.disabled",
    ]) {
      expect(prompt.match(new RegExp(`^- ${name.replaceAll(".", "\\.")}:`, "gm"))).toHaveLength(1);
    }
  });

  it("exports layout-derived tokens from the same values used by preview", () => {
    const ds = structuredClone(data.designSystems[0]);
    ds.foundations.layout = { sectionGap: 41, componentGap: 9, cardPadding: 27, controlRadius: 11, cardRadius: 19 };
    ds.foundations.elevation = [
      { x: 0, y: 0, blur: 0, spread: 0, opacity: 0, color: "#000000" },
      { x: 1, y: 4, blur: 12, spread: 0, opacity: 20, color: "#112233" },
    ];
    const prompt = createDesignSystemPrompt(ds);
    expect(prompt).toContain("radius.card: 19px");
    expect(prompt).toContain("spacing.card.padding: {spacing.1XL}");
    expect(prompt).toContain("shadow.card: 1px 4px 12px 0px rgba(17, 34, 51, 0.20)");
  });

  it("exports every spacing scale value as a token", () => {
    const ds = structuredClone(data.designSystems[0]);
    ds.foundations.spacingScale = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80];
    const prompt = createDesignSystemPrompt(ds);
    ["XS", "S", "M", "L", "XL", "1XL", "2XL", "3XL", "4XL", "5XL", "6XL"].forEach((name, index) => {
      expect(prompt).toContain(`spacing.${name}: ${ds.foundations.spacingScale[index]}px`);
    });
  });

  it("exports semantic spacing as named references without component spacing literals", () => {
    const ds = structuredClone(data.designSystems[0]);
    ds.foundations.spacingAliases = {
      pageMargin: "4XL", containerPadding: "XL", sectionGap: "3XL",
      componentGap: "M", cardPadding: "2XL", elementGap: "S",
    };
    const prompt = createDesignSystemPrompt(ds);
    expect(prompt).toContain("spacing.page.margin: {spacing.4XL}");
    expect(prompt).toContain("spacing.card.padding: {spacing.2XL}");
    expect(prompt).toContain("Section gap: {spacing.3XL}");
    expect(prompt).toContain("Component gap: {spacing.M}");
    expect(prompt).toContain("never hardcode a spacing number in a component");
  });

  it("uses each preset radius scale in both preview layout and prompt", () => {
    for (const ds of data.designSystems) {
      const layout = getLayout(ds);
      const prompt = createDesignSystemPrompt(ds);
      expect(layout.controlRadius).toBe(ds.foundations.radiusScale[1]);
      expect(layout.cardRadius).toBe(ds.foundations.radiusScale[2]);
      expect(prompt).toContain(`radius.card: ${layout.cardRadius}px`);
    }
  });

  it("uses the same semantic fallback values for preview and prompt", () => {
    const ds = structuredClone(data.designSystems[1]);
    const prompt = createDesignSystemPrompt(ds);
    for (const name of ["color.text.on-color", "color.status.info", "color.border.selected"]) {
      expect(prompt).toContain(`${name}: ${tokenValue(ds, name)}`);
    }
  });

  it("defaults border application to none and exports an enabled width", () => {
    const ds = structuredClone(data.designSystems[0]);
    expect(createDesignSystemPrompt(ds)).toContain("Border application: none");
    ds.foundations.border = { enabled: true, width: 3 };
    const prompt = createDesignSystemPrompt(ds);
    expect(prompt).toContain("Border application: enabled");
    expect(prompt).toContain("Border width: 3px");
  });

  it("exports badge size and radius from the component editor values", () => {
    const ds = structuredClone(data.designSystems[0]);
    ds.foundations.badge = { height: 30, fontSize: 12, paddingX: 12, paddingXToken: "M", radius: 15 };
    const prompt = createDesignSystemPrompt(ds);
    expect(prompt).toContain("Badge: height 30px; font 12px; horizontal padding {spacing.M}; radius 15px");
    expect(prompt).toContain("control.height.badge: 30px");
    expect(prompt).toContain("radius.badge: 15px");
  });

  it("keeps the primary default state bound directly to brand primary", () => {
    const ds = structuredClone(data.designSystems[0]);
    ds.tokens.push({ name: "color.interactive.default", category: "color", value: "#111111" });
    ds.tokens.find(token => token.name === "color.brand.primary")!.value = "#ABCDEF";
    expect(tokenValue(ds, "color.interactive.default")).toBe("#ABCDEF");
    expect(createDesignSystemPrompt(ds)).toContain("color.interactive.default: #ABCDEF");
  });

  it("exports the focus ring width used by preview controls", () => {
    const ds = structuredClone(data.designSystems[0]);
    ds.foundations.focusRing = { width: 5 };
    expect(createDesignSystemPrompt(ds)).toContain("Focus ring width: 5px");
  });
});
