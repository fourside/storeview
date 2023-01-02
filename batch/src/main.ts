import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { closeClient, dequeue, getClient, getLatestData, getQueueData, saveItemsAndImages } from "./db";
import { Env } from "./env";
import { fetchImages } from "./http";
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
        console.error("pass subcommand, items or subscribe");
        process.exit(-1);
    }
  } catch (error) {
    console.error(error);
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
  console.log("start", new Date());
  const latestData = await getLatestData(dbClient);

  const items = await scrapeItems(Env.targetUrl, latestData);
  console.log("scraped count: ", items.length);
  if (items.length === 0) {
    return;
  }
  const images = await fetchImages(items);
  await saveItemsAndImages(dbClient, items, images);
  console.log("\ndone", new Date());
}

async function subscribe(dbClient: PrismaClient): Promise<void> {
  const queueList = await getQueueData(dbClient);

  for (const queue of queueList) {
    try {
      const directory = path.join("../data/", queue.directory);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      fs.mkdir(directory, () => {});
      await scrapeImages(queue.url, directory);
      await dequeue(dbClient, queue);
      await sleep(1000 * 10);
    } catch (error) {
      console.error(error);
      console.log("caused queue:", queue);
    }
  }

  await sleep(10 * 60 * 1000);
  await subscribe(dbClient);
}
