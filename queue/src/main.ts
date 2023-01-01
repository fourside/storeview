import type { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { dequeue, getClient, getQueueData } from "./db";
import { scrape } from "./scrape";
import { sleep } from "./sleep";

async function main(): Promise<void> {
  const client = getClient();
  await subscribe(client);
}

if (process.argv[1] === __filename) {
  (async () => {
    await main();
    process.exit(0);
  })();
}

async function subscribe(prisma: PrismaClient): Promise<void> {
  const queueList = await getQueueData(prisma);
  for (const queue of queueList) {
    try {
      const directory = path.join("../data/", queue.directory);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      fs.mkdir(directory, () => {});
      await scrape(queue.url, directory);
      await dequeue(prisma, queue);
      await sleep(1000 * 10);
    } catch (error) {
      console.error(error);
      console.log("caused queue:", queue);
    }
  }

  await sleep(10 * 60 * 1000);
  await subscribe(prisma);
}
