import { config } from "dotenv";

config({ path: "../.env" });

export const Env = Object.freeze({
  chromePath: process.env.CHROME_PATH ?? "",
  targetUrl: process.env.TARGET_URL ?? "",
  production: process.env.NODE_ENV === "production",
});
