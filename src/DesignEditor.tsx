import { getTypography, scaleTypography, typeRoles } from "./lib/typography";
import type { DesignSystem } from "./types";
import "./design-editor.css";

type Props = { ds: DesignSystem; onChange: (next: DesignSystem) => void };

export function TypographyEditor({ ds, onChange }: Props) {
  const typography = getTypography(ds);
  const updateFoundations = (changes: Partial<DesignSystem["foundations"]>) =>
    onChange({ ...ds, foundations: { ...ds.foundations, ...changes } });
  const updateScale = (base: number, ratio: number) => {
    const scaled = scaleTypography(base, ratio);
    const roles = Object.fromEntries(typeRoles.map(role => [role, { ...typography.roles[role], size: scaled[role].size }])) as typeof typography.roles;
    updateFoundations({ bodySize: base, headingSize: roles.H2.size, typography: { ratio, roles } });
  };

  return <div className="typography-editor">
        <section className="type-family-row">
          <label htmlFor="type-font-family"><strong>Font family</strong><small>Một font duy nhất cho mọi vai trò chữ</small></label>
          <select id="type-font-family" value={ds.foundations.fontFamily} onChange={event => updateFoundations({ fontFamily: event.target.value })}>
            {["Plus Jakarta Sans", "Inter", "Nunito Sans", "IBM Plex Sans"].map(font => <option key={font}>{font}</option>)}
          </select>
        </section>
        <section className="type-section">
          <h3>Thang chữ</h3>
          <label className="type-control-row" htmlFor="type-base-size"><span>Cỡ chữ cơ sở</span><span className="type-number"><input id="type-base-size" type="number" min="10" max="24" value={typography.roles.Body.size} onChange={event => { const value = Number(event.target.value); if (value >= 10 && value <= 24) updateScale(value, typography.ratio); }} /> px</span></label>
          <label className="type-control-row" htmlFor="type-ratio"><span>Tỷ lệ thang</span><select id="type-ratio" value={typography.ratio} onChange={event => updateScale(typography.roles.Body.size, Number(event.target.value))}>
            <option value={1.125}>Major Second · 1.125</option>
            <option value={1.2}>Minor Third · 1.200</option>
            <option value={1.25}>Major Third · 1.250</option>
            <option value={1.333}>Perfect Fourth · 1.333</option>
            <option value={1.5}>Perfect Fifth · 1.500</option>
          </select></label>
        </section>
        <section className="type-section type-roles">
          <h3>Vai trò chữ (size / line-height / weight)</h3>
          <div className="type-role-head"><span>Role</span><span>Size</span><span>LH</span><span>Weight</span></div>
          {typeRoles.map(role => {
            const style = typography.roles[role];
            const updateRole = (changes: Partial<typeof style>) => {
              const next = { ...style, ...changes };
              updateFoundations({
                ...(role === "Body" ? { bodySize: next.size } : {}),
                ...(role === "H2" ? { headingSize: next.size } : {}),
                typography: { ...typography, roles: { ...typography.roles, [role]: next } },
              });
            };
            return <div className="type-role-row" key={role}>
              <strong>{role}</strong>
              <input aria-label={`${role} size`} type="number" min="8" max="96" value={style.size} onChange={event => { const value = Number(event.target.value); if (value >= 8 && value <= 96) updateRole({ size: value }); }} />
              <input aria-label={`${role} line height`} type="number" min="1" max="2" step="0.05" value={style.lineHeight} onChange={event => { const value = Number(event.target.value); if (value >= 1 && value <= 2) updateRole({ lineHeight: value }); }} />
              <select aria-label={`${role} weight`} value={style.weight} onChange={event => updateRole({ weight: Number(event.target.value) })}>
                {[400, 500, 600, 700, 800].map(weight => <option key={weight} value={weight}>{weight}</option>)}
              </select>
            </div>;
          })}
        </section>
  </div>;
}
