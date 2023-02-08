import { closeClient, getClient, getStaleItemsWithoutArchived, removeItems } from "./db";
import { removeLogger } from "./logger";
import { removeImagesInR2 } from "./r2-client";

export async function removeCommand(): Promise<void> {
  removeLogger.info("start", new Date());
  const dbClient = getClient();
  try {
    const today = new Date();
    const oneMonthAgo = new Date(new Date().setDate(today.getDate() - 15));
    const criteriaDate = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Tokyo",
    })
      .format(oneMonthAgo)
      .replaceAll("/", "-");
    const items = await getStaleItemsWithoutArchived(dbClient, criteriaDate);
    const imageFilenames = items.map((it) => it.thumbnailFileName).filter((it) => it !== "");
    if (imageFilenames.length === 0) {
      removeLogger.info("\ndone. nothing deleted.", new Date());
      return;
    }
    await removeImagesInR2(imageFilenames);
    const count = await removeItems(
      dbClient,
      items.map((it) => it.id)
    );
    removeLogger.info(`${count} items removed.`);
  } finally {
    closeClient(dbClient);
  }
  removeLogger.info("\ndone", new Date());
}
