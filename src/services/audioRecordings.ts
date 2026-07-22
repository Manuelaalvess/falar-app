import { Directory, File, Paths } from 'expo-file-system';

const RECORDINGS_DIR_NAME = 'item-recordings';

function getRecordingsDirectory(): Directory {
  const dir = new Directory(Paths.document, RECORDINGS_DIR_NAME);
  if (!dir.exists) dir.create();
  return dir;
}

export function getRecordingUri(itemId: string): string | null {
  const file = new File(getRecordingsDirectory(), `${itemId}.m4a`);
  return file.exists ? file.uri : null;
}

export function saveRecording(itemId: string, temporaryUri: string): string {
  const destination = new File(getRecordingsDirectory(), `${itemId}.m4a`);
  if (destination.exists) destination.delete();
  const source = new File(temporaryUri);
  source.copy(destination);
  return destination.uri;
}

export function deleteRecording(itemId: string): void {
  const file = new File(getRecordingsDirectory(), `${itemId}.m4a`);
  if (file.exists) file.delete();
}

/** Baixa uma gravacao da nuvem e salva no local padrao do item, sobrescrevendo se ja existir. */
export async function downloadAndSaveRecording(itemId: string, remoteUrl: string): Promise<string> {
  const destination = new File(getRecordingsDirectory(), `${itemId}.m4a`);
  if (destination.exists) destination.delete();
  const downloaded = await File.downloadFileAsync(remoteUrl, destination);
  return downloaded.uri;
}
