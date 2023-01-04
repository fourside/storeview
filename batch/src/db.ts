import { PrismaClient } from "@prisma/client";
import { ItemData, ImageData, QueueData } from "./type";

export type LatestData = {
  id: string;
  publishedAt: string;
};

export function getClient(): PrismaClient {
  return new PrismaClient();
}

export async function closeClient(client: PrismaClient): Promise<void> {
  await client.$disconnect();
}

export async function getLatestData(client: PrismaClient): Promise<LatestData> {
  const latest = await client.latest.findFirst();
  if (latest === null) {
    throw new Error("latest data not exists.");
  }
  return { id: latest.itemId, publishedAt: latest.publishedAt };
}

export async function saveItemsAndImages(client: PrismaClient, items: ItemData[], images: ImageData[]): Promise<void> {
  await client.$transaction([
    client.item.createMany({
      data: items.map((it) => ({
        id: it.id,
        title: it.title,
        url: it.url,
        category: it.category,
        totalPage: it.totalPage,
        publishedAt: it.publishedAt,
      })),
      skipDuplicates: true,
    }),
    client.image.createMany({
      data: images,
      skipDuplicates: true,
    }),
    client.latest.deleteMany(),
    client.latest.create({
      data: {
        itemId: items[0].id,
        publishedAt: items[0].publishedAt,
      },
    }),
  ]);
}

export async function getQueueData(client: PrismaClient): Promise<QueueData[]> {
  const queueDataList = await client.queue.findMany({
    where: {
      dequeued: false,
    },
    orderBy: [{ id: "asc" }],
    include: {
      Item: true,
    },
  });
  return queueDataList.map((it) => ({
    id: it.id,
    directory: it.directory,
    url: it.url,
    totalPage: it.Item?.totalPage ?? 0,
  }));
}

export async function dequeue(client: PrismaClient, queueData: QueueData): Promise<void> {
  await client.$transaction([
    client.queue.update({
      where: {
        id: queueData.id,
      },
      data: {
        dequeued: true,
        updatedAt: new Date(),
      },
    }),
  ]);
}
