import fs from "node:fs";
import path from "node:path";
import { QueueWithItem } from "./db";
import { ProgressData } from "./type";

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
