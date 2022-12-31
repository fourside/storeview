import { PrismaClient } from "@prisma/client";
import { QueueData } from "./type";

export function getClient(): PrismaClient {
  return new PrismaClient();
}

export async function closeClient(client: PrismaClient): Promise<void> {
  await client.$disconnect();
}

export async function getQueueData(client: PrismaClient): Promise<QueueData[]> {
  return await client.queue.findMany({
    where: {
      dequeued: false,
    },
    orderBy: [{ id: "asc" }],
  });
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
