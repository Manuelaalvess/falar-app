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

function formatReportTimestamp(date: Date): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatEventTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatWeeklyBlock(last7Days: DayCount[]): string {
  return last7Days.map((day) => `• ${day.label}: ${day.count}`).join('\n');
}

function formatRecentBlock(recent: CommunicationEvent[]): string {
  if (recent.length === 0) {
    return 'Nenhuma comunicação registrada ainda.';
  }

  return recent
    .map(
      (event, index) =>
        `${index + 1}. ${event.itemName} · ${event.categoryLabel} · ${formatEventTimestamp(event.timestamp)}`,
    )
    .join('\n');
}

export function buildTherapistReport(patientName: string, summary: EvolutionSummary): string {
  const overviewLines =
    summary.total > 0
      ? [
          `• Total de comunicações: ${summary.total}`,
          `• Categoria mais usada: ${summary.topCategory.label} (${summary.topCategory.count}x)`,
        ]
      : ['• Ainda sem comunicações registradas no app.'];

  return [
    'RESUMO FALAR — FONOAUDIOLOGIA',
    '─────────────────────────────',
    '',
    `Paciente: ${patientName}`,
    `Resumo gerado em: ${formatReportTimestamp(new Date())}`,
    '',
    'VISÃO GERAL',
    ...overviewLines,
    '',
    'FREQUÊNCIA — ÚLTIMOS 7 DIAS',
    formatWeeklyBlock(summary.last7Days),
    '',
    'ÚLTIMAS COMUNICAÇÕES',
    formatRecentBlock(summary.recent),
    '',
    '—',
    'App Falar · Comunicação Alternativa e Aumentativa (CAA)',
  ].join('\n');
}
