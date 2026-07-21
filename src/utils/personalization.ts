import type { CommunicationItem } from '../types/communication';
import type { CommunicationEvent } from '../types/evolution';

export function getItemUsageCounts(
  events: CommunicationEvent[],
  category: string,
): Record<string, number> {
  const counts: Record<string, number> = {};
  events.forEach((event) => {
    if (event.category !== category) return;
    counts[event.itemName] = (counts[event.itemName] ?? 0) + 1;
  });
  return counts;
}

export function sortItemsByUsage(
  items: CommunicationItem[],
  events: CommunicationEvent[],
  category: string,
): CommunicationItem[] {
  const counts = getItemUsageCounts(events, category);
  return [...items].sort((a, b) => (counts[b.name] ?? 0) - (counts[a.name] ?? 0));
}

export type TimeOfDayBucket = 'madrugada' | 'manha' | 'tarde' | 'noite';

export function getTimeOfDayBucket(date: Date = new Date()): TimeOfDayBucket {
  const hour = date.getHours();
  if (hour < 5) return 'madrugada';
  if (hour < 12) return 'manha';
  if (hour < 18) return 'tarde';
  return 'noite';
}

const MIN_EVENTS_FOR_SUGGESTION = 3;

export function getSuggestedCategory(events: CommunicationEvent[]): string | null {
  const bucket = getTimeOfDayBucket();
  const counts: Record<string, number> = {};

  events.forEach((event) => {
    if (getTimeOfDayBucket(new Date(event.timestamp)) !== bucket) return;
    counts[event.category] = (counts[event.category] ?? 0) + 1;
  });

  let topCategory: string | null = null;
  let topCount = 0;
  Object.entries(counts).forEach(([category, count]) => {
    if (count > topCount) {
      topCategory = category;
      topCount = count;
    }
  });

  return topCount >= MIN_EVENTS_FOR_SUGGESTION ? topCategory : null;
}
