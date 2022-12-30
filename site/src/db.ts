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
