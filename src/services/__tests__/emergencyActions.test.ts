import { Linking } from 'react-native';

import {
  getCallableContacts,
  getPrimaryEmergencyContact,
  triggerDoubleTapEmergency,
} from '../emergencyActions';
import type { EmergencyContact } from '../../types/emergency';

jest.mock('../firebase', () => ({ auth: {}, firestore: {} }));
jest.mock('../auth', () => ({ toE164BR: (phone: string) => `+55${phone.replace(/\D/g, '')}` }));
jest.mock('../emergency', () => ({ persistEmergencySosAlert: jest.fn() }));
jest.mock('../pushTokens', () => ({ getOtherDeviceTokens: jest.fn() }));
jest.mock('../expoPush', () => ({ sendPushNotifications: jest.fn() }));
jest.mock('../location', () => ({ getCurrentLocationMapsUrl: jest.fn() }));
jest.mock('../deviceId', () => ({ getDeviceId: jest.fn() }));
jest.mock('../../store/useAppStore', () => ({
  useAppStore: { getState: () => ({ setLastSosAlert: jest.fn() }) },
}));

jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);

const persistEmergencySosAlert = jest.requireMock('../emergency')
  .persistEmergencySosAlert as jest.Mock;
const getOtherDeviceTokens = jest.requireMock('../pushTokens').getOtherDeviceTokens as jest.Mock;
const getCurrentLocationMapsUrl = jest.requireMock('../location')
  .getCurrentLocationMapsUrl as jest.Mock;
const getDeviceId = jest.requireMock('../deviceId').getDeviceId as jest.Mock;

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

describe('triggerDoubleTapEmergency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCurrentLocationMapsUrl.mockResolvedValue('https://maps.example');
    getDeviceId.mockResolvedValue('device-a');
    getOtherDeviceTokens.mockResolvedValue(['token-b']);
    persistEmergencySosAlert.mockResolvedValue({
      id: 'alert-1',
      contactId: '1',
      contactName: 'Ana',
      mapsUrl: 'https://maps.example',
      timestamp: Date.now(),
    });
  });

  it('abre o discador e registra o alerta', async () => {
    const contact = makeContact();
    const result = await triggerDoubleTapEmergency('uid-test', contact);

    expect(Linking.openURL).toHaveBeenCalledWith('tel:+5511987654321');
    expect(persistEmergencySosAlert).toHaveBeenCalledWith(
      'uid-test',
      contact,
      'https://maps.example',
    );
    expect(getOtherDeviceTokens).toHaveBeenCalledWith('uid-test', 'device-a');
    expect(result.locationOk).toBe(true);
  });

  it('continua se o GPS falhar', async () => {
    getCurrentLocationMapsUrl.mockRejectedValue(new Error('sem gps'));
    const contact = makeContact();

    const result = await triggerDoubleTapEmergency('uid-test', contact);

    expect(persistEmergencySosAlert).toHaveBeenCalledWith('uid-test', contact, null);
    expect(result.locationOk).toBe(false);
  });
});
