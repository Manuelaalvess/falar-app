/** Combina os `loading` de cada hook de dados em uma unica flag de prontidao do app. */
export function useAppDataReady(...loadingFlags: boolean[]): boolean {
  return loadingFlags.every((loading) => !loading);
}
