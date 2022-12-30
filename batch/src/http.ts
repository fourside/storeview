import cliProgress from "cli-progress";
import { Env } from "./env";
import { sleep } from "./sleep";
import { ItemData, ImageData } from "./type";

export async function fetchImages(items: ItemData[]): Promise<ImageData[]> {
  const imageDataList: ImageData[] = [];
  const progressBar = new cliProgress.SingleBar({
    format: ` {bar} {percentage}% | {value}/{total}`,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });
  if (!Env.production) {
    progressBar.setTotal(items.length);
    progressBar.start(items.length, 0);
  }

  let count = 0;
  for (const item of items) {
    const res = await fetch(item.imageUrl);
    const arrayBuffer = await res.arrayBuffer();
    const image = Buffer.from(arrayBuffer);
    imageDataList.push({
      itemId: item.id,
      image,
    });
    if (!Env.production) {
      progressBar.update(++count);
    }
    await sleep(2000);
  }
  return imageDataList;
}
