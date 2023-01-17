import fs from "node:fs";
import puppeteer, { Page } from "puppeteer-core";
import { LatestData } from "./db";
import { Env } from "./env";
import { sleep } from "./sleep";
import { ItemData } from "./type";

export async function scrapeItems(url: string, latest: LatestData): Promise<ItemData[]> {
  const browser = await puppeteer.launch({
    executablePath: Env.chromePath,
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle2",
    });
    return await scrapePage(page, latest);
  } finally {
    await browser.close();
  }
}

async function scrapePage(page: Page, latest: LatestData): Promise<ItemData[]> {
  const items: ItemData[] = [];
  const generator = loopUntilGenerator(
    async () => {
      return await scrapeRows(page);
    },
    (items: ItemData[]) => {
      const found = items.findIndex(
        // not always found by id
        (it) => it.id === latest.id || new Date(it.publishedAt).getTime() < new Date(latest.publishedAt).getTime()
      );
      return [found !== -1, found];
    }
  );

  try {
    return await timeoutRetry<ItemData[]>(async () => {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const result = await generator.next();
        items.push(...result.value);
        if (result.done) {
          break;
        }
        await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2" }), page.click("#dnext")]);
        await sleep(3500);
      }
      return items;
    });
  } finally {
    // in case of failure of subsequence db process
    fs.writeFileSync("./items.json", JSON.stringify(items, null, 2));
  }
}

async function timeoutRetry<T>(asyncCallback: () => Promise<T>, attempt = 1, limit = 5): Promise<T> {
  try {
    return await asyncCallback();
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      if (attempt > limit) {
        throw new Error(`exceeded max retry [${limit}]`);
      }
      await timeoutRetry(asyncCallback, ++attempt, limit);
    }
    throw error;
  }
}

async function* loopUntilGenerator(
  loopProc: () => Promise<ItemData[]>,
  breakPredicate: (items: ItemData[]) => [found: boolean, foundIndex: number]
): AsyncGenerator<ItemData[], ItemData[], unknown> {
  while (true) {
    const items = await loopProc();
    const [found, foundIndex] = breakPredicate(items);
    if (found) {
      return items.slice(0, foundIndex);
    } else {
      yield items;
    }
  }
}

async function scrapeRows(page: Page): Promise<ItemData[]> {
  const trSelector = ".itg.gltc tr";
  await page.waitForSelector(trSelector);

  return await page.evaluate((selector) => {
    const rows = document.querySelectorAll(selector);

    function assertNotEmpty(value: string | unknown | null, name = ""): asserts value is string {
      if (typeof value !== "string") {
        throw new Error(`${name} is not string`);
      }
    }

    return Array.from(rows).flatMap((row, index) => {
      if (index === 0) {
        return [];
      }
      if (row.querySelector(".itd") !== null) {
        return [];
      }
      const titleAnchor = row.querySelector(".gl3c.glname a");
      const titleElement = titleAnchor?.querySelector(".glink");
      const title = titleElement?.textContent;
      const urlString = titleAnchor?.getAttribute("href");
      const category = row.querySelector(".gl1c.glcat")?.textContent;

      const totalPageString = row.querySelector(".gl4c div:nth-child(2)")?.textContent;
      assertNotEmpty(totalPageString, "totalPage");
      const totalPage = Number.parseInt(totalPageString);

      const publishedAt = row.querySelector(".gl2c")?.textContent?.slice(-16);
      const imgElement = row.querySelector(".gl2c .glthumb img");
      const imageUrl = imgElement?.getAttribute("data-src") ?? imgElement?.getAttribute("src");

      assertNotEmpty(title, "title");
      assertNotEmpty(urlString, "url");
      assertNotEmpty(category, "category");
      assertNotEmpty(publishedAt, "publishedAt");
      assertNotEmpty(imageUrl, "imageUrl");

      const url = new URL(urlString);
      const id = url.pathname.slice(2);

      return [{ id, title, url: urlString, category, totalPage, publishedAt, imageUrl }];
    });
  }, trSelector);
}
