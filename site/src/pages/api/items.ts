import type { NextApiRequest, NextApiResponse } from "next";
import { getItems } from "../../db";

export default async function handler(
  req: Pick<NextApiRequest, "query" | "method">,
  res: Pick<NextApiResponse, "status">
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const { page } = parseQuery(req.query);
  const items = await getItems(page);
  res.status(200).json(items);
}

function parseQuery(query: NextApiRequest["query"]): { page: number } {
  const page = query.page;
  if (page === undefined) {
    return { page: 0 };
  }
  if (Array.isArray(page)) {
    if (page[0] === undefined) {
      return { page: 0 };
    }
    return { page: Number(page[0]) };
  }
  return { page: Number(page) };
}
