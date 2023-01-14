import { sleep } from "./sleep";
import { ItemData, ImageData } from "./type";

export async function fetchImages(items: ItemData[]): Promise<ImageData[]> {
  const imageDataList: ImageData[] = [];

  for (const item of items) {
    const res = await fetch(item.imageUrl);
    const arrayBuffer = await res.arrayBuffer();
    const image = Buffer.from(arrayBuffer);
    imageDataList.push({
      itemId: item.id,
      image,
    });
    await sleep(2000);
  }
  return imageDataList;
}
