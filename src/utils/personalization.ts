import type { CommunicationItem } from '../types/communication';
import type { CommunicationEvent } from '../types/evolution';

function getItemUsageCounts(
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
