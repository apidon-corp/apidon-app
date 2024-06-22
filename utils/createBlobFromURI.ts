import { SaveFormat, manipulateAsync } from "expo-image-manipulator";

export default async function createBlobFromURI(uri: string): Promise<Blob> {
  const localUri = await createLocalFile(uri);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error(`Failed to fetch resource: ${xhr.statusText}`));
      }
    };
    xhr.onerror = (e) => {
      console.error("Failed to create blob from URI", e);
      reject(new Error("Network error"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", localUri, true);
    xhr.send();
  });
}

export async function createLocalFile(uri: string) {
  const result = await manipulateAsync(uri, [], {
    format: SaveFormat.JPEG,
  });

  return result.uri;
}
