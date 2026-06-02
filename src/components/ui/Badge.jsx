import { cn } from '../../lib/utils';

const VARIANTS = {
  default: 'bg-navy text-white',
  blue:    'bg-brand-pale text-brand',
  red:     'bg-crimson text-white',
  gold:    'bg-amber-100 text-amber-800',
  green:   'bg-green-100 text-green-700',
  muted:   'bg-surface text-muted border border-border',
};

/**
 * Badge — étiquette inline
 * @param {'default'|'blue'|'red'|'gold'|'green'|'muted'} variant
 */
export function Badge({ variant = 'default', className, children }) {
  return (
    <span className={cn(
      'inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full',
      VARIANTS[variant],
      className,
    )}>
      {children}
    </span>
  );
}
