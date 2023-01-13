import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { createQueue, getQueueList } from "../../db";
import { convertQueueToProgress } from "../../converter";
import { ProgressData } from "../../type";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  switch (req.method) {
    case "POST":
      return await post(req, res);
    case "GET":
      return await get(req, res);
    default:
      res.status(405);
  }
}

async function post(req: Pick<NextApiRequest, "body">, res: Pick<NextApiResponse, "status">): Promise<void> {
  try {
    const parsed = queueRequestBody.parse(JSON.parse(req.body));
    const id = await createQueue(parsed);
    res.status(201).send({ id });
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).send({
        errorMessage: error.message,
      });
    } else {
      console.error(error);
      res.status(500).end();
    }
  }
}

const queueRequestBody = z.object({
  url: z.string(),
  directory: z.string(),
  itemId: z.string(),
});

async function get(_: NextApiRequest, res: Pick<NextApiResponse<ProgressData[]>, "status">): Promise<void> {
  const queueList = await getQueueList();
  if (queueList.length === 0) {
    res.status(204).end();
    return;
  }
  res.status(200).send(queueList.map(convertQueueToProgress));
}
