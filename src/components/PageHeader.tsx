import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 min-w-0"
    >
      <h1 className="break-words font-heading text-2xl font-bold tracking-[0.5px] text-primary sm:text-3xl md:text-4xl">{title}</h1>
      {description && (
        <p className="mt-2 max-w-2xl break-words text-base leading-relaxed text-text-light md:text-lg">{description}</p>
      )}
    </motion.div>
  );
}
