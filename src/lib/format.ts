import type { Platform } from '@/types';

export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return '₹' + rupees.toLocaleString('en-IN');
}

export function formatPaiseShort(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 100000) {
    return '₹' + (rupees / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
  }
  if (rupees >= 1000) {
    return '₹' + (rupees / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return '₹' + rupees.toLocaleString('en-IN');
}

export function formatCompact(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString('en-IN');
}

export function cleanHandle(input: string): string {
  return input.trim().replace(/^@+/, '').replace(/\s+/g, '');
}

export function buildProfileUrl(platform: Platform, handle: string): string {
  const h = cleanHandle(handle);
  if (platform === 'instagram') return `https://instagram.com/${h}`;
  return `https://youtube.com/@${h}`;
}

// Instagram: 1-30 chars, letters, numbers, dots, underscores
// YouTube: 3-30 chars (channel handles), letters, numbers, hyphens, underscores
export function isValidHandle(platform: Platform, handle: string): boolean {
  const h = cleanHandle(handle);
  if (!h) return false;
  if (platform === 'instagram') {
    return /^[a-zA-Z0-9._]{1,30}$/.test(h);
  }
  return /^[a-zA-Z0-9_-]{3,30}$/.test(h);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function getFingerprint(): string {
  const nav = navigator;
  const screen = window.screen;
  const parts = [
    nav.userAgent,
    nav.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ];
  return btoa(parts.join('|')).slice(0, 32);
}
