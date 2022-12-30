export type ItemData = {
  id: string;
  title: string;
  url: string;
  category: string;
  publishedAt: string;
  imageUrl: string;
};

export type ImageData = {
  itemId: string;
  image: Buffer;
};
