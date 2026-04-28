import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type HeroBadge = {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
};

interface PageHeaderProps {
  title: string;
  description?: string;
  variant?: 'default' | 'hero';
  className?: string;
  heroClassName?: string;
  heroAccentClassName?: string;
  heroBadges?: HeroBadge[];
}

export function PageHeader({
  title,
  description,
  variant = 'default',
  className,
  heroClassName,
  heroAccentClassName,
  heroBadges,
}: PageHeaderProps) {
  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
          'relative mb-10 overflow-hidden rounded-[2.25rem] border border-header-navy/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,249,250,0.98)_58%,rgba(233,247,239,0.92))] px-6 py-7 shadow-[0_28px_72px_-46px_rgba(15,39,68,0.28)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(17,26,45,0.96),rgba(20,31,53,0.98)_58%,rgba(16,54,41,0.72))] dark:shadow-[0_30px_80px_-52px_rgba(0,0,0,0.75)] md:px-8 md:py-8 lg:px-10 lg:py-10',
          heroClassName,
          className
        )}
      >
        <div className="pointer-events-none absolute -left-12 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-header-navy/5 blur-3xl dark:bg-white/5" aria-hidden />
        <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-accent-green/10 blur-3xl dark:bg-accent-green/15" aria-hidden />
        <div
          className={cn(
            'pointer-events-none absolute inset-x-10 bottom-0 h-px bg-[linear-gradient(90deg,rgba(26,43,95,0),rgba(26,43,95,0.18),rgba(16,133,69,0.18),rgba(26,43,95,0))] dark:bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(120,165,255,0.28),rgba(51,214,139,0.32),rgba(255,255,255,0))]',
            heroAccentClassName
          )}
          aria-hidden
        />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="max-w-3xl">
            <div
              className={cn(
                'mb-4 h-1.5 w-24 rounded-full bg-[linear-gradient(90deg,#108545,#1A2B5F)]',
                heroAccentClassName
              )}
              aria-hidden
            />
            <h1 className="break-words font-heading text-2xl font-bold tracking-[0.5px] text-primary sm:text-3xl md:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-2xl break-words text-base leading-relaxed text-text-light dark:text-muted-foreground md:text-lg">
                {description}
              </p>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-4" aria-hidden>
            {(heroBadges?.length ? heroBadges : [{ icon: null as never }, { icon: null as never }, { icon: null as never }]).map((badge, index) => {
              if (!badge?.icon) {
                return (
                  <div
                    key={`shape-${index}`}
                    className={cn(
                      index === 0 &&
                        'flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-header-navy shadow-[0_18px_45px_-28px_rgba(15,39,68,0.45)] dark:bg-primary dark:shadow-[0_18px_45px_-28px_rgba(0,0,0,0.6)]',
                      index === 1 &&
                        'mt-10 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white ring-1 ring-header-navy/10 shadow-[0_16px_40px_-28px_rgba(15,39,68,0.28)] dark:bg-card dark:ring-white/10 dark:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.55)]',
                      index === 2 &&
                        '-mt-8 flex h-12 w-12 items-center justify-center rounded-[1rem] bg-accent-green shadow-[0_16px_36px_-24px_rgba(16,133,69,0.42)] dark:shadow-[0_16px_36px_-24px_rgba(0,0,0,0.58)]'
                    )}
                  />
                );
              }

              const Icon = badge.icon;

              return (
                <div
                  key={`${title}-badge-${index}`}
                  className={cn(
                    index === 0 &&
                      'flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-header-navy text-white shadow-[0_18px_45px_-28px_rgba(15,39,68,0.45)] dark:bg-primary dark:text-primary-foreground dark:shadow-[0_18px_45px_-28px_rgba(0,0,0,0.6)]',
                    index === 1 &&
                      'mt-10 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white text-header-navy ring-1 ring-header-navy/10 shadow-[0_16px_40px_-28px_rgba(15,39,68,0.28)] dark:bg-card dark:text-foreground dark:ring-white/10 dark:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.55)]',
                    index === 2 &&
                      '-mt-8 flex h-12 w-12 items-center justify-center rounded-[1rem] bg-accent-green text-white shadow-[0_16px_36px_-24px_rgba(16,133,69,0.42)] dark:text-white dark:shadow-[0_16px_36px_-24px_rgba(0,0,0,0.58)]',
                    badge.className
                  )}
                >
                  <Icon className={cn(index === 0 ? 'h-7 w-7' : 'h-6 w-6', badge.iconClassName)} />
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('mb-8 min-w-0', className)}
    >
      <h1 className="break-words font-heading text-2xl font-bold tracking-[0.5px] text-primary dark:text-foreground sm:text-3xl md:text-4xl">{title}</h1>
      {description && (
        <p className="mt-2 max-w-2xl break-words text-base leading-relaxed text-text-light dark:text-muted-foreground md:text-lg">{description}</p>
      )}
    </motion.div>
  );
}
