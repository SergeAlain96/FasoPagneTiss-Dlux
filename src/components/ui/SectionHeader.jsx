import { cn } from '../../lib/utils';

/**
 * SectionHeader — entête de section uniforme
 * @param {'light'|'dark'} theme - fond clair ou sombre
 * @param {'left'|'center'} align
 */
export function SectionHeader({ eyebrow, title, subtitle, theme = 'light', align = 'center', className }) {
  const isDark = theme === 'dark';
  return (
    <div className={cn('space-y-3', align === 'center' && 'text-center', className)}>
      {eyebrow && (
        <p className={cn('text-[11px] font-bold tracking-[0.3em] uppercase', isDark ? 'text-blue-300' : 'text-brand')}>
          {eyebrow}
        </p>
      )}
      <h2 className={cn('font-serif font-bold leading-tight', isDark ? 'text-white' : 'text-ink')}>
        {title}
      </h2>
      {/* Filet doré */}
      <div className={cn('h-px w-12 bg-gradient-to-r from-transparent via-amber-400 to-transparent', align === 'center' && 'mx-auto')} />
      {subtitle && (
        <p className={cn('leading-relaxed font-light', isDark ? 'text-white/60' : 'text-muted', align === 'center' && 'max-w-xl mx-auto')}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
