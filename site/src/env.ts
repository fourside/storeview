export const Env = Object.freeze({
  thumbnailHost: process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_BUCKET_URL ?? "",
  cloudflareBucketName: process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_BUCKET_URL ?? "",
});
