export type ItemData = {
  id: string;
  title: string;
  url: string;
  category: string;
  totalPage: number;
  publishedAt: string;
  removed: boolean;
  thumbnailFileName: string;
  queued: boolean;
  archiveUrl?: string;
};

export type ProgressData = {
  directory: string;
  progress: number;
  total: number;
  archiveUrl: string | undefined;
};

export type NotReadCountData = {
  count: number;
  lastReadAt: string;
};

export type ErrorResponse = { message: string };
