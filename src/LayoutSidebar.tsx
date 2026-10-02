import type { DesignSystem } from './types';
import { TokenValueEditor } from './TokenTable';
import { tokenDefinition, type TokenGroup } from './lib/designTokens';
import './layout-sidebar.css';

function masterLabel(name: string): string {
  const labels: Record<string,string> = {
    'color.brand.primary':'Primary color', 'color.brand.secondary':'Secondary color', 'color.brand.tertiary':'Tertiary color', 'color.neutral.base':'Neutral color',
    'foundation.fontFamily':'Font family', 'foundation.typography.roles.Body.size':'Base font size', 'foundation.typography.ratio':'Type scale ratio',
    'foundation.density':'Density', 'foundation.contentWidth':'Content width', 'foundation.radiusScale.1':'Control radius', 'foundation.radiusScale.2':'Surface radius',
    'spacing.page.margin':'Page margin', 'spacing.section.gap':'Section gap', 'spacing.component.gap':'Component gap', 'radius.button':'Button radius',
  };
  if (labels[name]) return labels[name];
  if (/^spacing\.[A-Z0-9]+$/.test(name)) return `Spacing ${name.slice(8)}`;
  const last = name.split('.').at(-1)!;
  return last.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,letter => letter.toUpperCase());
}

export function DesignSystemSidebar({ ds, onChange, onViewTokens }: { ds: DesignSystem; onChange: (next: DesignSystem) => void; onViewTokens: (group: TokenGroup) => void }) {
  const names = ['color.brand.primary','color.brand.secondary','color.brand.tertiary','color.neutral.base','color.status.success','color.status.warning','color.status.danger'];
  const count = ds.tokens.filter(token => token.override !== undefined && tokenDefinition(token).group === 'Color').length;
  return <div className="ds-sidebar-editor master-controls">
    <h2>Master controls</h2>
    <div className="master-group-heading"><strong>Color</strong><button type="button" onClick={() => onViewTokens('Color')}>View tokens</button></div>
    <p className="master-override-count">{count} overrides · linked tokens follow master changes</p>
    {names.map(name => { const token = ds.tokens.find(t => t.name === name); if (!token) return null; return <div className="master-control" key={name}><label>{masterLabel(name)}</label><TokenValueEditor ds={ds} token={token} onChange={onChange} master /></div>; })}
  </div>;
}
