import { getSuggestedCategory, getTimeOfDayBucket, sortItemsByUsage } from '../personalization';
import type { CommunicationItem } from '../../types/communication';
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

describe('getTimeOfDayBucket', () => {
  it('classifica madrugada, manha, tarde e noite corretamente', () => {
    expect(getTimeOfDayBucket(new Date(2024, 0, 1, 3))).toBe('madrugada');
    expect(getTimeOfDayBucket(new Date(2024, 0, 1, 9))).toBe('manha');
    expect(getTimeOfDayBucket(new Date(2024, 0, 1, 15))).toBe('tarde');
    expect(getTimeOfDayBucket(new Date(2024, 0, 1, 21))).toBe('noite');
  });
});

describe('sortItemsByUsage', () => {
  const items: CommunicationItem[] = [
    { id: '1', name: 'Água', emoji: '💧' },
    { id: '2', name: 'Comida', emoji: '🍽️' },
    { id: '3', name: 'Banheiro', emoji: '🚽' },
  ];

  it('ordena itens do mais usado para o menos usado na categoria', () => {
    const events: CommunicationEvent[] = [
      makeEvent({ itemName: 'Banheiro' }),
      makeEvent({ itemName: 'Banheiro' }),
      makeEvent({ itemName: 'Comida' }),
    ];

    const sorted = sortItemsByUsage(items, events, 'preciso');
    expect(sorted.map((item) => item.name)).toEqual(['Banheiro', 'Comida', 'Água']);
  });

  it('ignora eventos de outras categorias', () => {
    const events: CommunicationEvent[] = [makeEvent({ category: 'lugares', itemName: 'Comida' })];

    const sorted = sortItemsByUsage(items, events, 'preciso');
    expect(sorted.map((item) => item.name)).toEqual(['Água', 'Comida', 'Banheiro']);
  });
});

describe('getSuggestedCategory', () => {
  it('retorna null quando nao ha eventos suficientes no periodo atual', () => {
    const events: CommunicationEvent[] = [makeEvent()];
    expect(getSuggestedCategory(events)).toBeNull();
  });

  it('sugere a categoria mais usada no periodo atual quando ha eventos suficientes', () => {
    const now = Date.now();
    const events: CommunicationEvent[] = [
      makeEvent({ category: 'comidas', timestamp: now }),
      makeEvent({ category: 'comidas', timestamp: now }),
      makeEvent({ category: 'comidas', timestamp: now }),
    ];
    expect(getSuggestedCategory(events)).toBe('comidas');
  });
});
