import { Item, NotReadCount, PrismaClient, Queue } from "@prisma/client";

const prisma = new PrismaClient();

export type ItemWithQueue = Item & { Queue: Queue | null };

export async function getItems(page = 0): Promise<ItemWithQueue[]> {
  const perPage = 90;
  return await prisma.item.findMany({
    orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
    skip: page * perPage,
    take: perPage,
    include: {
      Queue: true,
    },
  });
}

export async function getArchivedItems(page = 0): Promise<ItemWithQueue[]> {
  const perPage = 90;
  return await prisma.item.findMany({
    orderBy: [{ Queue: { updatedAt: "desc" } }],
    skip: page * perPage,
    take: perPage,
    include: {
      Queue: true,
    },
    where: {
      Queue: {
        archiveUrl: {
          not: null,
        },
      },
    },
  });
}

export async function createQueue(param: { directory: string; url: string; itemId: string }): Promise<number> {
  const newQueue = await prisma.queue.create({
    data: {
      url: param.url,
      directory: param.directory,
      dequeued: false,
      itemId: param.itemId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  return newQueue.id;
}

export type QueueWithItem = Queue & { Item: Item | null };

export async function getQueueList(): Promise<QueueWithItem[]> {
  const date = new Date();
  date.setDate(date.getDate() - 2);
  return await prisma.queue.findMany({
    where: {
      createdAt: {
        gte: date,
      },
    },
    orderBy: [{ id: "desc" }],
    include: {
      Item: true,
    },
  });
}

export async function getNotReadCount(): Promise<NotReadCount | undefined> {
  const notReadCount = await prisma.notReadCount.findFirst();
  return notReadCount ?? undefined;
}

export async function readAll(): Promise<void> {
  await prisma.notReadCount.updateMany({
    data: {
      count: 0,
      lastReadAt: new Date(),
    },
  });
}
