export default async function createBlobFromURI(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  const blob = await response.blob();

  return blob;
}
