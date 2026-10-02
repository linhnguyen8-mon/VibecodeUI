import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ButtonAnatomy } from './ButtonAnatomy';
import { designSystems } from './data/libraryData';
import { editDesignToken, normalizeDesignSystem } from './lib/designTokens';
import { getButtonSize } from './lib/button';
import { createDesignSystemPrompt } from './lib/library';

describe('Button anatomy demo', () => {
  it('renders one Primary M instance for each preset', () => {
    for (const preset of designSystems) {
      const ds = normalizeDesignSystem(preset);
      const html = renderToStaticMarkup(<ButtonAnatomy ds={ds} />);
      const metrics = getButtonSize(ds, 'M');
      expect(html.match(/<button\b/g)).toHaveLength(1);
      expect(html).toContain('Continue');
      expect(html).toContain(`--button-height:${metrics.height}px`);
      expect(html).toContain(`--button-icon-size:${metrics.iconSize}px`);
      expect(html).toContain('aria-label="Button anatomy, dimensions and tokens"');
    }
  });
  it('reads edited dimensions from canonical M tokens without changing other sizes', () => {
    const initial = normalizeDesignSystem(designSystems[0]);
    let edited = initial;
    for (const [property, value] of [['height','60px'],['iconSize','22px'],['iconGap','10px'],['paddingY','9px'],['fontSize','15px']] as const) edited = editDesignToken(edited, `foundation.buttonSizes.M.${property}`, value, 'override');
    const html = renderToStaticMarkup(<ButtonAnatomy ds={edited} />);
    expect(html).toContain('--button-height:60px');
    expect(html).toContain('--button-icon-size:22px');
    expect(html).toContain('--button-icon-gap:10px');
    expect(html).toContain('--button-padding-y:9px');
    expect(html).toContain('--button-font-size:15px');
    expect(getButtonSize(edited, 'S')).toEqual(getButtonSize(initial, 'S'));
    expect(createDesignSystemPrompt(edited)).toContain('foundation.buttonSizes.M.iconSize: 22px');
  });
});
