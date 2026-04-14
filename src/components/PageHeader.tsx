import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  variant?: 'default' | 'hero';
  className?: string;
}

export function PageHeader({ title, description, variant = 'default', className }: PageHeaderProps) {
  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
          'relative mb-10 overflow-hidden rounded-[2.25rem] border border-header-navy/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,249,250,0.98)_58%,rgba(233,247,239,0.92))] px-6 py-7 shadow-[0_28px_72px_-46px_rgba(15,39,68,0.28)] md:px-8 md:py-8 lg:px-10 lg:py-10',
          className
        )}
      >
        <div className="pointer-events-none absolute -left-12 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-header-navy/5 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-accent-green/10 blur-3xl" aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-[linear-gradient(90deg,rgba(26,43,95,0),rgba(26,43,95,0.18),rgba(16,133,69,0.18),rgba(26,43,95,0))]"
          aria-hidden
        />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="max-w-3xl">
            <div className="mb-4 h-1.5 w-24 rounded-full bg-[linear-gradient(90deg,#108545,#1A2B5F)]" aria-hidden />
            <h1 className="break-words font-heading text-2xl font-bold tracking-[0.5px] text-primary sm:text-3xl md:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-2xl break-words text-base leading-relaxed text-text-light md:text-lg">
                {description}
              </p>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-4" aria-hidden>
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-header-navy shadow-[0_18px_45px_-28px_rgba(15,39,68,0.45)]" />
            <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white ring-1 ring-header-navy/10 shadow-[0_16px_40px_-28px_rgba(15,39,68,0.28)]" />
            <div className="-mt-8 flex h-12 w-12 items-center justify-center rounded-[1rem] bg-accent-green shadow-[0_16px_36px_-24px_rgba(16,133,69,0.42)]" />
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
      <h1 className="break-words font-heading text-2xl font-bold tracking-[0.5px] text-primary sm:text-3xl md:text-4xl">{title}</h1>
      {description && (
        <p className="mt-2 max-w-2xl break-words text-base leading-relaxed text-text-light md:text-lg">{description}</p>
      )}
    </motion.div>
  );
}
