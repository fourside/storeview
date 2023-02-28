import type { NextApiRequest, NextApiResponse } from "next";
import { readAll } from "../../../db";

export async function PUT(req: NextApiRequest, res: NextApiResponse): Promise<Response> {
  try {
    await readAll();
    return new Response();
  } catch (error) {
    console.error(error);
    return new Response("server error", { status: 500 });
  }
}
