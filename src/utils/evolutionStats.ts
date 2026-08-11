import type { CommunicationEvent } from '../types/evolution';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export interface CategoryUsage {
  label: string;
  count: number;
}

export interface DayCount {
  label: string;
  count: number;
}

export interface EvolutionSummary {
  total: number;
  topCategory: CategoryUsage;
  last7Days: DayCount[];
  recent: CommunicationEvent[];
}

export function getTopCategory(events: CommunicationEvent[]): CategoryUsage {
  const counts: Record<string, number> = {};
  events.forEach((event) => {
    counts[event.categoryLabel] = (counts[event.categoryLabel] ?? 0) + 1;
  });

  let topLabel = 'Nenhuma';
  let topCount = 0;
  Object.entries(counts).forEach(([label, count]) => {
    if (count > topCount) {
      topLabel = label;
      topCount = count;
    }
  });

  return { label: topLabel, count: topCount };
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

export function getEvolutionSummary(events: CommunicationEvent[]): EvolutionSummary {
  return {
    total: events.length,
    topCategory: getTopCategory(events),
    last7Days: getLast7DaysCounts(events),
    recent: getRecentEvents(events, 8),
  };
}

export function buildTherapistReport(patientName: string, summary: EvolutionSummary): string {
  const dayCounts = summary.last7Days.map((day) => day.count).join(', ');
  const recentNames = summary.recent.map((event) => event.itemName).join(', ') || 'nenhum';
  const firstDay = summary.last7Days[0]?.label ?? '';
  const lastDay = summary.last7Days[6]?.label ?? '';

  return [
    'Resumo para a consulta de fonoaudiologia',
    `Paciente: ${patientName}`,
    `Total de comunicações registradas: ${summary.total}`,
    `Categoria mais usada: ${summary.topCategory.label} (${summary.topCategory.count}x)`,
    `Últimos 7 dias: ${dayCounts} comunicações por dia (de ${firstDay} a ${lastDay})`,
    `Últimas comunicações: ${recentNames}`,
  ].join('\n');
}
