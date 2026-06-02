import { cn } from '../../lib/utils';

const VARIANTS = {
  primary:   'bg-brand hover:bg-brand-dark text-white shadow-md shadow-brand/20 hover:shadow-lg hover:shadow-brand/35 hover:-translate-y-px',
  secondary: 'border-2 border-brand text-brand hover:bg-brand hover:text-white',
  ghost:     'border border-white/25 text-white hover:bg-white/10',
  dark:      'bg-navy hover:bg-navy-soft text-white',
  danger:    'bg-crimson hover:bg-red-700 text-white',
  wa:        'bg-[#25D366] hover:bg-[#1DAF54] text-white shadow-md shadow-[#25D366]/25 hover:shadow-lg hover:shadow-[#25D366]/40',
  muted:     'bg-surface hover:bg-border text-muted border border-border',
};

const SIZES = {
  xs: 'text-[10px] px-3.5 py-1.5 h-8 gap-1.5',
  sm: 'text-[11px] px-4.5 py-2 h-9 gap-1.5',
  md: 'text-xs px-6 py-3 h-11 gap-2',
  lg: 'text-sm px-8 py-3.5 h-12 gap-2',
  xl: 'text-sm px-10 py-4 h-14 gap-2.5',
};

/**
 * Button — composant de base réutilisable
 * @param {'primary'|'secondary'|'ghost'|'dark'|'danger'|'wa'|'muted'} variant
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size
 */
export function Button({ variant = 'primary', size = 'md', className, children, asChild, ...props }) {
  const classes = cn(
    'inline-flex items-center justify-center font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer shrink-0 rounded-full',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  if (asChild) {
    // Passe les classes à l'enfant unique (ex: <Link>)
    const child = children;
    return { ...child, props: { ...child.props, className: cn(classes, child.props.className) } };
  }

  return <button className={classes} {...props}>{children}</button>;
}

/** Lien stylisé comme un Button */
export function ButtonLink({ href, target, rel, variant = 'primary', size = 'md', className, children }) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={cn(
        'inline-flex items-center justify-center font-bold tracking-widest uppercase transition-all duration-200 shrink-0 rounded-full',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {children}
    </a>
  );
}
