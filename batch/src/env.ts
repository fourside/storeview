import { config } from "dotenv";

config({ path: "../.env" });

export const Env = Object.freeze({
  chromePath: process.env.CHROME_PATH ?? "",
  targetUrl: process.env.TARGET_URL ?? "",
  production: process.env.NODE_ENV === "production",
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
  cloudflareAccessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID ?? "",
  cloudflareSecretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY ?? "",
  cloudflareBucketName: process.env.CLOUDFLARE_BUCKET_NAME ?? "",
});
