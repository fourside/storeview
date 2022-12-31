import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { createQueue } from "../../db";

export default async function handler(
  req: Pick<NextApiRequest, "body" | "method">,
  res: Pick<NextApiResponse, "status">
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405);
    return;
  }
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
});
