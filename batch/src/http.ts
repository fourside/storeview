import { sleep } from "./sleep";
import type { ItemData, ImageData } from "./type";

export async function fetchImages(items: ItemData[]): Promise<ImageData[]> {
  const imageDataList: ImageData[] = [];

  for (const item of items) {
    const res = await fetch(item.imageUrl);
    const arrayBuffer = await res.arrayBuffer();
    const image = Buffer.from(arrayBuffer);
    imageDataList.push({
      itemId: item.id,
      image,
      mimeType: res.headers.get("content-type") ?? "image/jpeg",
      fileName: item.thumbnailFileName,
    });
    await sleep(2000);
  }
  return imageDataList;
}
