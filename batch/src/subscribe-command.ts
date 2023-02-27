import fs from "node:fs";
import path from "node:path";
import { archive } from "./archive";
import { closeClient, dequeue, getClient, getQueueData, removeItem } from "./db";
import { Env } from "./env";
import { subscribeLogger } from "./logger";
import { uploadZipToR2 } from "./r2-client";
import { RemovedError } from "./removed-error";
import { scrapeImages } from "./scrape-images";
import { sleep } from "./sleep";

export async function subscribeCommand(): Promise<void> {
  subscribeLogger.info("start", new Date());
  const dbClient = getClient();
  try {
    const queueList = await getQueueData(dbClient);

    for (const queue of queueList) {
      try {
        const directory = path.join(Env.dataDir, queue.directory);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory);
        }
        const imageCount = fs.readdirSync(directory).length;
        if (imageCount < queue.totalPage) {
          await scrapeImages(queue.url, directory, imageCount);
        }
        if (queue.archiveUrl == undefined) {
          const { fileName, zip } = await archive(directory);
          const { bucketKey } = await uploadZipToR2(fileName, zip);
          queue.archiveUrl = bucketKey;
        }
        await dequeue(dbClient, queue);
        await sleep(1000 * 10);
      } catch (error) {
        if (error instanceof RemovedError) {
          subscribeLogger.error("removed", queue);
          await dequeue(dbClient, queue);
          if (queue.itemId !== undefined) {
            await removeItem(dbClient, queue.itemId);
          }
          continue;
        }
        subscribeLogger.error(error, "caused queue is ", queue);
      }
    }
  } finally {
    closeClient(dbClient);
  }
  subscribeLogger.info("\ndone", new Date());
}
