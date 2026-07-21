import * as Location from 'expo-location';

export async function getCurrentLocationMapsUrl(): Promise<string | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const { latitude, longitude } = position.coords;
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}
