import { config } from "dotenv";

config({ path: "../.env" });

export const Env = Object.freeze({
  chromePath: process.env.CHROME_PATH ?? notSetVariable("CHROME_PATH"),
  targetUrl: process.env.TARGET_URL ?? notSetVariable("TARGET_URL"),
  dataDir: process.env.DATA_DIR ?? notSetVariable("DATA_DIR"),
  production: process.env.NODE_ENV === "production",
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? notSetVariable("CLOUDFLARE_ACCOUNT_ID"),
  cloudflareAccessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID ?? notSetVariable("CLOUDFLARE_ACCESS_KEY_ID"),
  cloudflareSecretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY ?? notSetVariable("CLOUDFLARE_SECRET_ACCESS_KEY"),
  cloudflareBucketName: process.env.CLOUDFLARE_BUCKET_NAME ?? notSetVariable("CLOUDFLARE_BUCKET_NAME"),
});

function notSetVariable(name: string): never {
  throw new Error(`${name} not exists`);
}
