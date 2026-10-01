import fs from 'node:fs';
const registry = JSON.parse(fs.readFileSync(new URL('../src/qaSkills.json', import.meta.url), 'utf8'));
const translations = JSON.parse(fs.readFileSync(new URL('../src/qaSkillTranslations.json', import.meta.url), 'utf8'));
const expanded = registry.map(skill => ({ ...skill, translations: translations[skill.id] }));
const docs = new URL('../docs/', import.meta.url);
fs.mkdirSync(docs, { recursive: true });
fs.writeFileSync(new URL('skills-content.json', docs), JSON.stringify(expanded, null, 2) + '\n');
const lines = ['# Bộ skill QA cho sản phẩm AI-gen', '', `${registry.length} skill / ${new Set(registry.map(s => s.group)).size} group / ${registry.reduce((n,s) => n+s.criteria.length,0)} tiêu chí.`, '', '## Cấu trúc', '', '- ID, tên, group; mô tả card VI/EN và khi sử dụng.', '- Scope, stage, problem, detects.', '- 4 base inputs + tối đa 2 input riêng.', '- Checklist: ID, title, description = điều kiện Fail nếu.', '- Principle IDs và slop signal IDs.', '- Output contract 7 field; prompt template chung.', '- Review lưu riêng: checked, status, note, include in prompt.', '', 'Không có field Hard rules hoặc Framework sources. Hướng dẫn QA chung nằm trong prompt.', '', 'Trạng thái: pass / fail / review / na. Thiếu bằng chứng → review. Checklist được lưu theo ID tiêu chí; dữ liệu cũ không được tự đổi thành kết luận cho tiêu chí mới.', ''];
for (const group of new Set(registry.map(s => s.group))) {
 lines.push(`## ${group}`, '');
 for (const skill of registry.filter(s => s.group === group)) {
  const tr = translations[skill.id];
  lines.push(`### ${skill.name} · ${skill.id}`, '', `Tên VI: ${tr.nameVI}`, '', `Card VI: ${skill.shortDescription}`, `Card EN: ${skill.cardEN}`, '', `Khi dùng VI: ${skill.whenToUse}`, `Khi dùng EN: ${tr.whenEN}`, '', `Scope: ${skill.scopes.join(', ')}`, `Stage: ${skill.stages.join(', ')}`, `Problem: ${skill.problems.join(', ')}`, `Detects: ${skill.detects.join(', ')}`, `Principles: ${skill.principleIds.join(', ')}`, `Slop signals: ${skill.slopSignalIds.join(', ') || 'Không có'}`, '', '**Input fields**', '', '```json', JSON.stringify(skill.inputs,null,2), '```', '', '**Checklist VI / EN**', '');
  skill.criteria.forEach((c,i) => lines.push(`#### ${c.id} · ${c.title}`, '', `VI: ${tr.criteria[i].titleVI} — ${c.description}`, '', `EN: ${c.title} — ${tr.criteria[i].descriptionEN}`, ''));
  lines.push('**Output contract**', '', ...skill.outputContract.map(x => '- '+x), '', '**Prompt template**', '', '```text',skill.promptTemplate,'```','');
 }
}
fs.writeFileSync(new URL('skills-content-review.md',docs),lines.join('\n')+'\n');
