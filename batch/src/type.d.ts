export type ItemData = {
  id: string;
  title: string;
  url: string;
  category: string;
  totalPage: number;
  publishedAt: string;
  imageUrl: string;
};

export type ImageData = {
  itemId: string;
  image: Buffer;
};

export type QueueData = {
  id: number;
  url: string;
  directory: string;
  totalPage: number;
  itemId?: string;
};
