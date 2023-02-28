import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { createQueue, getQueueList } from "../../../db";
import { convertQueueToProgress } from "../../../converter";

export async function POST(req: Request, res: NextApiResponse): Promise<Response> {
  try {
    const json = await req.json();
    const parsed = queueRequestBody.parse(json);
    const id = await createQueue(parsed);
    return new Response(JSON.stringify({ id }), {
      status: 201,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return new Response(JSON.stringify({ errorMessage: error.message }), { status: 404 });
    } else {
      return new Response("server error", { status: 500 });
    }
  }
}

const queueRequestBody = z.object({
  url: z.string(),
  directory: z.string(),
  itemId: z.string(),
});

export async function GET(_: NextApiRequest, res: NextApiResponse): Promise<Response> {
  const queueList = await getQueueList();
  if (queueList.length === 0) {
    return new Response("", { status: 204 });
  }
  return new Response(JSON.stringify(queueList.map(convertQueueToProgress)));
}
