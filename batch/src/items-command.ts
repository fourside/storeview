import { closeClient, getClient, getLatestData, incrementNotReadCount, saveItems } from "./db";
import { Env } from "./env";
import { fetchImages } from "./http";
import { itemsLogger } from "./logger";
import { uploadImagesToR2 } from "./r2-client";
import { scrapeItems } from "./scrape-items";

export async function itemsCommand(): Promise<void> {
  itemsLogger.info("start", new Date());
  const dbClient = getClient();
  try {
    const latestData = await getLatestData(dbClient);

    const items = await scrapeItems(Env.targetUrl, latestData);
    itemsLogger.info(`scraped count: ${items.length}`);
    if (items.length === 0) {
      return;
    }
    const images = await fetchImages(items);
    await saveItems(dbClient, items);
    await uploadImagesToR2(images);
    await incrementNotReadCount(dbClient, items.length);
  } finally {
    closeClient(dbClient);
  }
  itemsLogger.info("\ndone", new Date());
}
