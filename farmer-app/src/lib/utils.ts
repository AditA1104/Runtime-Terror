import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-IN').format(val);
}

export function formatTimeSlot(start: string, end: string): string {
  // Handles '09:00:00' -> '09:00 AM'
  const formatSingle = (t: string) => {
    if (!t) return '';
    const parts = t.split(':');
    let hours = parseInt(parts[0], 10);
    const mins = parts[1] || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${mins} ${ampm}`;
  };

  return `${formatSingle(start)} – ${formatSingle(end)}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatRelativeTime(timestamp: string): string {
  if (!timestamp) return '';
  const now = new Date();
  const past = new Date(timestamp);
  const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
  return formatDate(timestamp.split('T')[0]);
}

export function kgToQuintal(kg: number): number {
  return Math.round((kg / 100) * 10) / 10;
}

export function quintalToKg(quintal: number): number {
  return Math.round(quintal * 100);
}
