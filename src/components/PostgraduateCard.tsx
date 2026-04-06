import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileDown } from 'lucide-react';
import { resolvePublicMediaUrl } from '@/lib/utils';

interface PostgraduateCardProps {
  name: string;
  bio: string;
  image?: string | null;
  index?: number;
  cvLink?: string;
  /** Public PDF URL from Admin → Staff CV */
  cvPdfUrl?: string | null;
}

export function PostgraduateCard({ name, bio, image, index = 0, cvLink = '#staff-cv', cvPdfUrl }: PostgraduateCardProps) {
  const imageSrc = resolvePublicMediaUrl(image ?? undefined);
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
      <div className="flex flex-col items-center text-center">
        <div className="h-64 w-full overflow-hidden bg-primary/5">
          <Avatar className="h-full w-full rounded-none border-0">
            {imageSrc && <AvatarImage src={imageSrc} alt={name} className="h-full w-full object-cover object-top" />}
            <AvatarFallback className="h-full w-full rounded-none bg-primary/10 text-4xl font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="p-6">
          <h3 className="mt-3 font-heading text-base font-bold tracking-[0.5px] text-primary">{name}</h3>
          <p className="mt-2 line-clamp-3 text-sm text-text-light">{bio}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button asChild className="bg-primary text-white hover:bg-primary/90">
              {cvLink.startsWith('#') ? (
                <a href={cvLink}>View profile</a>
              ) : (
                <Link to={cvLink}>View profile</Link>
              )}
            </Button>
            {cvPdfUrl ? (
              <Button asChild variant="outline" className="border-primary/30 text-primary gap-1.5">
                <a href={cvPdfUrl} target="_blank" rel="noopener noreferrer">
                  <FileDown className="h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}