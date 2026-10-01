import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  src?: string | null;
  alt?: string;
}

export function BookCover({ src, alt = '' }: BookCoverProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: '#F0EAE0' }}
      >
        <BookOpen size={40} className="text-text-secondary" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="object-cover w-full h-full"
    />
  );
}
