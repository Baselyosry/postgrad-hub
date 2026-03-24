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
      className="mb-8"
    >
      <h1 className="font-heading text-3xl font-bold tracking-[0.5px] text-primary md:text-4xl">{title}</h1>
      {description && (
        <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-light">{description}</p>
      )}
    </motion.div>
  );
}
