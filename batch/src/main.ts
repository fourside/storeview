import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import {
  closeClient,
  dequeue,
  getClient,
  getLatestData,
  getQueueData,
  incrementNotReadCount,
  removeItem,
  saveItemsAndImages,
} from "./db";
import { Env } from "./env";
import { fetchImages } from "./http";
import { itemsLogger, rootLogger, subscribeLogger } from "./logger";
import { uploadImagesToR2 } from "./r2-client";
import { RemovedError } from "./removed-error";
import { scrapeImages } from "./scrape-images";
import { scrapeItems } from "./scrape-items";
import { sleep } from "./sleep";

async function main(args: string[]): Promise<void> {
  const subCommand = args[0];
  let dbClient;
  try {
    switch (subCommand) {
      case "items":
        dbClient = getClient();
        return await scrapeItemsAndImages(dbClient);
      case "subscribe":
        dbClient = getClient();
        return await subscribe(dbClient);
      default:
        rootLogger.error("pass subcommand, items or subscribe");
        process.exit(-1);
    }
  } catch (error) {
    rootLogger.error(error);
    process.exit(-1);
  } finally {
    if (dbClient !== undefined) {
      closeClient(dbClient);
    }
  }
}

if (process.argv[1] === __filename) {
  (async () => {
    await main(process.argv.slice(2));
    process.exit(0);
  })();
}

async function scrapeItemsAndImages(dbClient: PrismaClient): Promise<void> {
  itemsLogger.info("start", new Date());
  const latestData = await getLatestData(dbClient);

  const items = await scrapeItems(Env.targetUrl, latestData);
  itemsLogger.info(`scraped count: ${items.length}`);
  if (items.length === 0) {
    return;
  }
  const images = await fetchImages(items);
  await saveItemsAndImages(dbClient, items, images);
  await uploadImagesToR2(images);
  await incrementNotReadCount(dbClient, items.length);
  itemsLogger.info("\ndone", new Date());
}

async function subscribe(dbClient: PrismaClient): Promise<void> {
  const queueList = await getQueueData(dbClient);

  for (const queue of queueList) {
    try {
      const directory = path.join("../data/", queue.directory);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
      }
      const imageCount = fs.readdirSync(directory).length;
      await scrapeImages(queue.url, directory, imageCount);
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

  await sleep(10 * 60 * 1000);
  await subscribe(dbClient);
}
