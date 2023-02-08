import { itemsCommand } from "./items-command";
import { rootLogger } from "./logger";
import { removeCommand } from "./remove-command";
import { subscribeCommand } from "./subscribe-command";

async function main(args: string[]): Promise<void> {
  const subCommand = args[0];
  try {
    switch (subCommand) {
      case "items":
        return itemsCommand();
      case "subscribe":
        return subscribeCommand();
      case "remove":
        return removeCommand();
      default:
        rootLogger.error("pass subcommand, items, subscribe or remove");
        process.exit(-1);
    }
  } catch (error) {
    rootLogger.error(error);
    process.exit(-1);
  }
}

if (process.argv[1] === __filename) {
  (async () => {
    await main(process.argv.slice(2));
    process.exit(0);
  })();
}
