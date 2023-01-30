import { NotReadCount } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { dateFormat } from "./date-format";
import { ItemWithQueue, QueueWithItem } from "./db";
import { ItemData, NotReadCountData, ProgressData } from "./type";

export function convertItem(itemWithQueue: ItemWithQueue): ItemData {
  return {
    id: itemWithQueue.id,
    title: itemWithQueue.title,
    url: itemWithQueue.url,
    category: itemWithQueue.category,
    totalPage: itemWithQueue.totalPage,
    publishedAt: itemWithQueue.publishedAt,
    removed: itemWithQueue.removed,
    thumbnailFileName: itemWithQueue.thumbnailFileName,
    queued: itemWithQueue.Queue !== null,
    archiveUrl: itemWithQueue.Queue?.archiveUrl ?? undefined,
  };
}

export function convertQueueToProgress(queue: QueueWithItem): ProgressData {
  if (queue.dequeued) {
    return {
      directory: queue.directory,
      progress: 100,
      total: 100,
    };
  }
  const realDir = path.join("../data", queue.directory);
  const progress = fs.existsSync(realDir) ? fs.readdirSync(realDir).length : 0;
  const total = queue.Item?.totalPage ?? 0;
  return {
    directory: queue.directory,
    progress,
    total,
  };
}

export function convertNotReadCount(notReadCount: NotReadCount | undefined): NotReadCountData {
  if (notReadCount === undefined) {
    return { count: 0, lastReadAt: "not read yet" };
  }
  return {
    count: notReadCount.count,
    lastReadAt:
      notReadCount.lastReadAt.getTime() === new Date(Date.UTC(1970, 0)).getTime()
        ? "not read yet"
        : dateFormat(notReadCount.lastReadAt),
  };
}
