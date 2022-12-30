import { closeClient, getClient, getLatestData, saveItemsAndImages } from "./db";
import { Env } from "./env";
import { fetchImages } from "./http";
import { scrape } from "./scrape";

async function main(): Promise<void> {
  console.log("start", new Date());
  let dbClient;
  try {
    dbClient = getClient();
    const latestData = await getLatestData(dbClient);

    const items = await scrape(Env.targetUrl, latestData);
    console.log("scraped count: ", items.length);
    if (items.length === 0) {
      return;
    }
    const images = await fetchImages(items);
    await saveItemsAndImages(dbClient, items, images);
    console.log("\ndone", new Date());
  } catch (error) {
    console.error(error, new Date());
  } finally {
    if (dbClient !== undefined) {
      await closeClient(dbClient);
    }
  }
}

if (process.argv[1] === __filename) {
  (async () => {
    await main();
    process.exit(0);
  })();
}
