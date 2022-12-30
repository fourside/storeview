import { Item } from "@prisma/client";
import { z } from "zod";

export async function fetchItems(page = 0): Promise<Item[]> {
  const res = await fetch(`/api/items${page === 0 ? "" : `?page=${page}`}`);
  const json = await res.json();
  const result = ItemResponse.safeParse(json);
  if (result.success) {
    return result.data;
  }
  throw new Error("parse error");
}

const ItemResponse = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    url: z.string(),
    category: z.string(),
    publishedAt: z.string(),
  })
);
