import { Item } from "@prisma/client";
import { z } from "zod";

export async function fetchItems(page = 0): Promise<Item[]> {
  const res = await fetch(`/api/items${page === 0 ? "" : `?page=${page}`}`);
  const json = await res.json();
  const result = itemResponse.safeParse(json);
  if (result.success) {
    return result.data;
  }
  throw new Error("fetch items response parse error");
}

const itemResponse = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    url: z.string(),
    category: z.string(),
    publishedAt: z.string(),
  })
);

export async function postQueue(param: { directory: string; url: string }): Promise<number> {
  const res = await fetch("/api/queue", {
    method: "POST",
    body: JSON.stringify(param),
  });
  const json = await res.json();
  const result = postQueueResponse.safeParse(json);
  if (result.success) {
    return result.data.id;
  }
  throw new Error("post queue parse error");
}

const postQueueResponse = z.object({
  id: z.number(),
});
