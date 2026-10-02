import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BadgeAnatomy } from './BadgeAnatomy';
import { designSystems } from './data/libraryData';
import { editDesignToken, normalizeDesignSystem } from './lib/designTokens';
import { getBadge } from './lib/badge';
import { getButtonSize } from './lib/button';
import { createDesignSystemPrompt } from './lib/library';

describe('Badge anatomy demo', () => {
  it('renders one real, passive badge without configuration controls for every preset', () => {
    for (const preset of designSystems) {
      const ds = normalizeDesignSystem(preset);
      const html = renderToStaticMarkup(<BadgeAnatomy ds={ds} />);
      const metrics = getBadge(ds);
      expect(html.match(/class="eg-badge /g)).toHaveLength(1);
      expect(html).not.toMatch(/<(button|select|input)\b/);
      expect(html).toContain(`--badge-height:${metrics.height}px`);
      expect(html).toContain(`--badge-padding-x:${metrics.paddingX}px`);
      expect(html).toContain('View ×2 · values in actual px');
    }
  });
  it('keeps edited badge dimensions synchronized with preview and prompt', () => {
    const initial = normalizeDesignSystem(designSystems[0]);
    let edited = initial;
    for (const [property, value] of [['height', '30px'], ['paddingX', '12px'], ['radius', '7px'], ['fontSize', '13px']] as const) {
      edited = editDesignToken(edited, `foundation.badge.${property}`, value, 'override');
    }
    expect(getBadge(edited)).toMatchObject({ height: 30, paddingX: 12, radius: 7, fontSize: 13 });
    const html = renderToStaticMarkup(<BadgeAnatomy ds={edited} />);
    expect(html).toContain('--badge-height:30px');
    expect(html).toContain('--badge-padding-x:12px');
    expect(html).toContain('--badge-radius:7px');
    expect(html).toContain('--badge-font-size:13px');
    const prompt = createDesignSystemPrompt(edited);
    expect(prompt).toContain('Badge: height 30px; font 13px');
    expect(prompt).toContain('radius 7px');
    expect(getButtonSize(edited, 'M')).toEqual(getButtonSize(initial, 'M'));
  });
});
