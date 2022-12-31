import { config } from "dotenv";

config({ path: "../.env" });

export const Env = Object.freeze({
  chromePath: process.env.CHROME_PATH ?? "",
  production: process.env.NODE_ENV === "production",
});
