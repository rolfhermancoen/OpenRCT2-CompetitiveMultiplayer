import { debug } from "@src/utils/logger";
import { subscribe } from "./subscribe";
import { NETWORK_CHAT } from "./subscribe/enum";
import { NetworkChatEvent } from "./subscribe/types";

const PREFIX = new RegExp("^(!|/)");

/**
 * Gets the command out of a string
 * @param string
 * @returns the command string or null
 */
export const get = (string: string): string | null => {
  if (string.match(PREFIX)) {
    return string.replace(PREFIX, "").trim();
  }
  return null;
};

/**
 * matches a string with an array of commands and returns true if a match is found
 * @param string
 * @param commands
 * @returns
 */
export const match = (string: string, commands: RegExp[]): boolean => {
  for (const command of commands) {
    if (command.test(string)) {
      const ret = string.substring(command.source.length, string.length).trim();
      return ret ? true : false;
    }
  }
  return false;
};

/**
 * watches the chat for commands given as parameter and fires callback when commands matches
 * @param commands
 * @param callback
 * @returns
 */
export const watch = (
  commands: RegExp[],
  callback: (e: NetworkChatEvent) => void
): IDisposable => {
  debug(`[commands] watch(): ${commands.join(",")}`);
  return subscribe(NETWORK_CHAT, (event) => {
    const { message } = event;
    const command = get(message);

    if (!command) {
      return;
    }

    if (match(command, commands)) {
      debug(`[commands] watch(): ${commands.join(",")}, fires callback`);
      callback(event);
    }
  });
};
