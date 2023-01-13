import type { NextApiRequest, NextApiResponse } from "next";
import { readAll } from "../../db";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  switch (req.method) {
    case "PUT":
      return await put(req, res);
    default:
      res.status(405);
  }
}

async function put(_: NextApiRequest, res: Pick<NextApiResponse, "status">): Promise<void> {
  try {
    await readAll();
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}
