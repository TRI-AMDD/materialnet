import { format } from 'd3-format';

export function createFormatter(spec, prefix, suffix) {
  const base = format(spec);

  if (!prefix && !suffix) {
    return base;
  }
  return (v) => `${prefix || ''}${base(v)}${suffix || ''}`;
}
