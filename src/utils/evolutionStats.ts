import type { CommunicationEvent } from '../types/evolution';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export interface CategoryUsage {
  label: string;
  count: number;
}

export function getTopCategory(events: CommunicationEvent[]): CategoryUsage {
  const counts: Record<string, number> = {};
  events.forEach((event) => {
    counts[event.categoryLabel] = (counts[event.categoryLabel] ?? 0) + 1;
  });

  let topLabel = '—';
  let topCount = 0;
  Object.entries(counts).forEach(([label, count]) => {
    if (count > topCount) {
      topLabel = label;
      topCount = count;
    }
  });

  return { label: topLabel, count: topCount };
}

export interface DayCount {
  label: string;
  count: number;
}

export function getLast7DaysCounts(events: CommunicationEvent[]): DayCount[] {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    days.push(date);
  }

  return days.map((day) => {
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const count = events.filter(
      (event) => event.timestamp >= day.getTime() && event.timestamp < next.getTime(),
    ).length;
    return { label: DAY_LABELS[day.getDay()], count };
  });
}

export function getRecentEvents(events: CommunicationEvent[], max: number): CommunicationEvent[] {
  return [...events].sort((a, b) => b.timestamp - a.timestamp).slice(0, max);
}

export function buildTherapistReport(patientName: string, events: CommunicationEvent[]): string {
  const total = events.length;
  const topCategory = getTopCategory(events);
  const last7Days = getLast7DaysCounts(events);
  const recent = getRecentEvents(events, 8);

  const dayCounts = last7Days.map((day) => day.count).join(', ');
  const recentNames = recent.map((event) => event.itemName).join(', ') || '—';

  return [
    'Resumo para a consulta de fonoaudiologia',
    `Paciente: ${patientName}`,
    `Total de comunicações registradas: ${total}`,
    `Categoria mais usada: ${topCategory.label} (${topCategory.count}x)`,
    `Últimos 7 dias: ${dayCounts} comunicações por dia (de ${last7Days[0].label} a ${last7Days[6].label})`,
    `Últimas comunicações: ${recentNames}`,
  ].join('\n');
}
