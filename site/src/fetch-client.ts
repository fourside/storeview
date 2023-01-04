import { Item } from "@prisma/client";
import { z } from "zod";
import { ProgressData } from "./type";

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
    totalPage: z.number(),
    publishedAt: z.string(),
  })
);

export async function postQueue(param: { directory: string; url: string; itemId: string }): Promise<number> {
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

export async function getProgressDataList(): Promise<ProgressData[]> {
  const res = await fetch("/api/queue");
  const json = await res.json();
  const result = getProgressDataListResponse.safeParse(json);
  if (result.success) {
    return result.data;
  }
  throw new Error("get queue list parse error");
}

const getProgressDataListResponse = z.array(
  z.object({
    directory: z.string(),
    progress: z.number(),
    total: z.number(),
  })
);
