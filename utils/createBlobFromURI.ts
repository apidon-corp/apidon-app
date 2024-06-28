import { SaveFormat, manipulateAsync } from "expo-image-manipulator";

export default async function createBlobFromURI(uri: string): Promise<Blob> {
  const localUri = await createLocalFile(uri);

  console.log(localUri);

  const response = await fetch(localUri);
  const blob = await response.blob();

  return blob;
}

export async function createLocalFile(uri: string) {
  const result = await manipulateAsync(uri, [], {
    format: SaveFormat.JPEG,
  });

  return result.uri;
}
