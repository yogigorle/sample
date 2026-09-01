import { Instagram, Youtube } from 'lucide-react';
import type { Platform } from '@/types';

export function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  if (platform === 'instagram') {
    return <Instagram className={className} aria-label="Instagram" />;
  }
  return <Youtube className={className} aria-label="YouTube" />;
}
