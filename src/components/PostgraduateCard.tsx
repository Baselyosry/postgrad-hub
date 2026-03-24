import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PostgraduateCardProps {
  name: string;
  bio: string;
  image?: string | null;
  index?: number;
}

export function PostgraduateCard({ name, bio, image, index = 0 }: PostgraduateCardProps) {
  const initials = name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card-institutional overflow-hidden rounded-md bg-white p-0 shadow-sm"
    >
      <div className="flex flex-col items-center p-6 text-center">
        <Avatar className="h-20 w-20 border-2 border-secondary/30">
          {image && <AvatarImage src={image} alt={name} className="object-cover" />}
          <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <h3 className="mt-3 font-heading text-base font-bold tracking-[0.5px] text-primary">{name}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-text-light">{bio}</p>
      </div>
    </motion.div>
  );
}
