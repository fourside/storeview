import { Image, Item, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getItems(page = 0): Promise<Item[]> {
  const perPage = 90;
  return await prisma.item.findMany({
    orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
    skip: page * perPage,
    take: perPage,
  });
}

export async function getImage(itemId: string): Promise<Image | null> {
  return await prisma.image.findUnique({
    where: { itemId: itemId },
  });
}

export async function createQueue(param: { directory: string; url: string }): Promise<number> {
  const newQueue = await prisma.queue.create({
    data: {
      url: param.url,
      directory: param.directory,
      dequeued: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  return newQueue.id;
}
