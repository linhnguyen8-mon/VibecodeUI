import type { DesignToken } from '../types';

export function referenceName(value: string): string | undefined {
  return value.match(/^ref:(.+)$/)?.[1] ?? value.match(/^\{([^}]+)\}$/)?.[1];
}
export function resolveTokenGraph(tokens: DesignToken[]): Map<string, string> {
  const source = new Map(tokens.map(token => [token.name, token]));
  const values = new Map<string, string>();
  const visit = (name: string, chain: string[] = []): string => {
    if (values.has(name)) return values.get(name)!;
    if (chain.includes(name)) throw new Error(`Reference cycle: ${[...chain, name].join(' → ')}`);
    const token = source.get(name);
    if (!token) throw new Error(`Missing reference: ${name}`);
    const raw = token.override ?? token.value;
    const ref = referenceName(raw);
    if (ref && source.get(ref)?.category !== token.category && source.has(ref)) throw new Error(`Reference type mismatch: ${name} → ${ref}`);
    const target = ref ? source.get(ref) : undefined;
    if (target && token.valueKind && target.valueKind && (token.valueKind !== target.valueKind || token.valueKind === 'number' && token.unit !== target.unit)) throw new Error(`Reference type mismatch: ${name} → ${ref}`);
    const resolved = ref ? visit(ref, [...chain, name]) : raw;
    const value = token.opacity !== undefined && token.override === undefined
      ? `color-mix(in srgb, ${resolved} ${Number((token.opacity * 100).toFixed(8))}%, transparent)` : resolved;
    values.set(name, value);
    return value;
  };
  for (const token of tokens) visit(token.name);
  return values;
}
