import { pino } from "pino";

const logger = pino({});

export const rootLogger = logger.child({ domain: "root" });
export const itemsLogger = logger.child({ domain: "items" });
export const subscribeLogger = logger.child({ domain: "subscribe" });
