import { toE164BR } from '../auth';

jest.mock('../firebase', () => ({ auth: {} }));
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signInWithPhoneNumber: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
}));

describe('toE164BR', () => {
  it('adiciona +55 para numeros sem codigo de pais', () => {
    expect(toE164BR('11987654321')).toBe('+5511987654321');
  });

  it('remove formatacao (parenteses, espacos, traco)', () => {
    expect(toE164BR('(11) 98765-4321')).toBe('+5511987654321');
  });

  it('preserva o + e o codigo de pais quando ja informado', () => {
    expect(toE164BR('+5511987654321')).toBe('+5511987654321');
  });

  it('preserva codigo de pais diferente de 55 quando ja tem +', () => {
    expect(toE164BR('+1 555 123 4567')).toBe('+15551234567');
  });
});
