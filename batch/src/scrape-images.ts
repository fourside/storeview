import fs from "node:fs";
import path from "node:path";
import puppeteer, { Page } from "puppeteer-core";
import { Env } from "./env";
import { RemovedError } from "./removed-error";
import { sleep } from "./sleep";

export async function scrapeImages(listUrl: string, directory: string, imageCount: number): Promise<void> {
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
    const pageCount = Math.floor(imageCount / 40) - 1;
    const listPageUrl = pageCount === 0 ? listUrl : `${listUrl}?p=${pageCount}`;
    const startImageCount = imageCount % 40;
    let [url, error] = await getFirstImageURL(page, listPageUrl, startImageCount);
    if (error !== undefined) {
      if (error instanceof RemovedError) {
        throw error;
      }
      const newListUrl = `${listPageUrl}?nw=always`;
      [url, error] = await getFirstImageURL(page, newListUrl, startImageCount);
      if (error !== undefined) {
        throw error;
      }
    }
    const totalPage = await getTotalPage(page);
    await page.goto(url, {
      waitUntil: "networkidle2",
    });
    return await scrapePage(page, directory, totalPage);
  } finally {
    await browser.close();
  }
}

async function getFirstImageURL(page: Page, listUrl: string, imageCount: number): Promise<[string, Error | undefined]> {
  const response = await page.goto(listUrl, { waitUntil: "networkidle2" });
  const imageAnchorList = await page.$$("#gdt a");
  const firstImage = imageAnchorList[imageCount];
  const hrefProperty = await firstImage?.getProperty("href");
  if (hrefProperty === undefined) {
    const chain = response?.request().redirectChain();
    if (chain !== undefined && chain.length > 0) {
      return ["", new RemovedError()];
    }
    return ["", new Error("not scrape first image href")];
  }
  const url = await hrefProperty.jsonValue();
  return [url, undefined];
}

async function getTotalPage(listPage: Page): Promise<number> {
  const details = await listPage.$$("#gdd .gdt2");
  for (const detail of details) {
    const text = await detail.getProperty("textContent");
    const value = await text.jsonValue();
    if (value !== null && / page/.test(value)) {
      return Number.parseInt(value); // ignore ' pages' string
    }
  }
  throw new Error("not scrape total page");
}

async function scrapePage(page: Page, directory: string, totalPage: number): Promise<void> {
  let pageCount = 0;
  let retryAttempt = 0;
  const retryLimit = 5;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const img = await page.$("img#img");
      if (img === null) {
        throw new Error("not scrape img");
      }
      const srcAttribute = await img.getProperty("src");
      const src = await srcAttribute.jsonValue();
      await fetchImage(src, directory);
      await Promise.all([
        page.waitForNavigation({ waitUntil: ["load", "networkidle2"] }),
        page.waitForSelector("#img"),
        img.click(),
      ]);

      pageCount++;
      if (totalPage === pageCount) {
        break;
      }
      await sleep(3500);
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        if (retryAttempt > retryLimit) {
          throw new Error(`exceeded max retry [${retryAttempt}]`);
        }
        retryAttempt++;
      }
      console.log("page url: ", page.url());
      throw error;
    }
  }
}

async function fetchImage(url: string, directory: string): Promise<void> {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const image = Buffer.from(arrayBuffer);
  const filename = path.basename(url);
  fs.writeFileSync(path.join(directory, filename), image);
}
