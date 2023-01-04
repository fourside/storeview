import type { NextApiRequest, NextApiResponse } from "next";
import { getImage } from "../../db";

export default async function handler(
  req: Pick<NextApiRequest, "query" | "method">,
  res: Pick<NextApiResponse, "status">
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const query = parseQuery(req.query);
  if (query === undefined) {
    res.status(404).end();
    return;
  }
  const image = await getImage(query.itemId);
  if (image === null) {
    res.status(404).end();
    return;
  }
  res.status(200).setHeader("Content-Type", "image/png").send(image.image);
}

function parseQuery(query: NextApiRequest["query"]): { itemId: string } | undefined {
  const itemId = query.item_id;
  if (Array.isArray(itemId)) {
    if (itemId[0] === undefined) {
      return undefined;
    }
    return { itemId: itemId[0] };
  }
  if (itemId === undefined) {
    return undefined;
  }
  return { itemId };
}
