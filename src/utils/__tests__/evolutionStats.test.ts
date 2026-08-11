import {
  buildTherapistReport,
  getEvolutionSummary,
  getLast7DaysCounts,
  getRecentEvents,
  getTopCategory,
} from '../evolutionStats';
import type { CommunicationEvent } from '../../types/evolution';

function makeEvent(overrides: Partial<CommunicationEvent> = {}): CommunicationEvent {
  return {
    id: 'evt-1',
    category: 'preciso',
    categoryLabel: 'Preciso de',
    itemName: 'Água',
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('getTopCategory', () => {
  it('retorna a categoria com mais eventos', () => {
    const events: CommunicationEvent[] = [
      makeEvent({ categoryLabel: 'Preciso de' }),
      makeEvent({ categoryLabel: 'Comidas' }),
      makeEvent({ categoryLabel: 'Comidas' }),
    ];
    expect(getTopCategory(events)).toEqual({ label: 'Comidas', count: 2 });
  });

  it('retorna placeholder quando nao ha eventos', () => {
    expect(getTopCategory([])).toEqual({ label: 'Nenhuma', count: 0 });
  });
});

describe('getLast7DaysCounts', () => {
  it('retorna 7 dias com contagem zero quando nao ha eventos', () => {
    const result = getLast7DaysCounts([]);
    expect(result).toHaveLength(7);
    expect(result.every((day) => day.count === 0)).toBe(true);
  });

  it('conta eventos de hoje no ultimo dia da lista', () => {
    const events: CommunicationEvent[] = [makeEvent({ timestamp: Date.now() })];
    const result = getLast7DaysCounts(events);
    expect(result[6].count).toBe(1);
  });
});

describe('getRecentEvents', () => {
  it('ordena do mais recente para o mais antigo e limita ao maximo', () => {
    const events: CommunicationEvent[] = [
      makeEvent({ id: '1', itemName: 'A', timestamp: 1000 }),
      makeEvent({ id: '2', itemName: 'B', timestamp: 3000 }),
      makeEvent({ id: '3', itemName: 'C', timestamp: 2000 }),
    ];
    const recent = getRecentEvents(events, 2);
    expect(recent.map((event) => event.itemName)).toEqual(['B', 'C']);
  });
});

describe('buildTherapistReport', () => {
  it('inclui nome do paciente e total de comunicacoes', () => {
    const events: CommunicationEvent[] = [makeEvent()];
    const report = buildTherapistReport('Seu Pai', getEvolutionSummary(events));
    expect(report).toContain('Seu Pai');
    expect(report).toContain('Total de comunicações registradas: 1');
  });
});
