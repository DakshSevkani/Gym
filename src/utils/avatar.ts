import { SyntheticEvent } from 'react';

// Curated, guaranteed working Unsplash avatar image URLs for members, trainers, and users
const CURATED_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
];

export function getAvatarUrl(id?: string | number, name?: string): string {
  if (!id && !name) return CURATED_AVATARS[0];

  let hash = 0;
  const str = String(id || '') + String(name || '');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CURATED_AVATARS.length;
  return CURATED_AVATARS[index];
}

export function handleAvatarError(e: SyntheticEvent<HTMLImageElement, Event>, name?: string) {
  const target = e.currentTarget;
  const fallbackName = encodeURIComponent(name || 'User');
  target.onerror = null; // Prevent infinite error loops
  target.src = `https://ui-avatars.com/api/?name=${fallbackName}&background=0284c7&color=fff&bold=true&size=128`;
}
