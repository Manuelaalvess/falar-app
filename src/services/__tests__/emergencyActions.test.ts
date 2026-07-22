import { getCallableContacts, getPrimaryEmergencyContact } from '../emergencyActions';
import type { EmergencyContact } from '../../types/emergency';

jest.mock('../firebase', () => ({ auth: {}, firestore: {} }));
jest.mock('../auth', () => ({ toE164BR: jest.fn() }));
jest.mock('../emergency', () => ({ persistEmergencySosAlert: jest.fn() }));
jest.mock('../pushTokens', () => ({ getOtherDeviceTokens: jest.fn() }));
jest.mock('../expoPush', () => ({ sendPushNotifications: jest.fn() }));

function makeContact(overrides: Partial<EmergencyContact> = {}): EmergencyContact {
  return {
    id: '1',
    name: 'Ana',
    relation: 'Filha',
    phone: '11987654321',
    emoji: '👩',
    ...overrides,
  };
}

describe('getCallableContacts', () => {
  it('filtra contatos sem telefone cadastrado', () => {
    const contacts = [makeContact({ id: '1', phone: '' }), makeContact({ id: '2' })];
    expect(getCallableContacts(contacts).map((c) => c.id)).toEqual(['2']);
  });

  it('ignora telefone so com espacos em branco', () => {
    const contacts = [makeContact({ phone: '   ' })];
    expect(getCallableContacts(contacts)).toEqual([]);
  });
});

describe('getPrimaryEmergencyContact', () => {
  it('retorna o primeiro contato com telefone, respeitando a ordem da lista', () => {
    const contacts = [
      makeContact({ id: '1', phone: '' }),
      makeContact({ id: '2', phone: '11911111111' }),
      makeContact({ id: '3', phone: '11922222222' }),
    ];
    expect(getPrimaryEmergencyContact(contacts)?.id).toBe('2');
  });

  it('retorna null quando nenhum contato tem telefone', () => {
    const contacts = [makeContact({ phone: '' })];
    expect(getPrimaryEmergencyContact(contacts)).toBeNull();
  });
});
