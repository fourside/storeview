import type { NextApiResponse } from "next";
import { convertItem } from "../../../converter";
import { getItems } from "../../../db";

export async function GET(req: Request, res: NextApiResponse): Promise<Response> {
  const { page } = parseQuery(req.url);
  const items = await getItems(page);
  return new Response(JSON.stringify(items.map(convertItem)));
}

function parseQuery(urlString: string): { page: number } {
  const url = new URL(urlString);
  const searchParams = new URLSearchParams(url.searchParams);
  const page = searchParams.get("page");
  return { page: page === null ? 0 : Number(page) };
}
