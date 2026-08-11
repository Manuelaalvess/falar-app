import { sortItemsByUsage } from '../personalization';
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
