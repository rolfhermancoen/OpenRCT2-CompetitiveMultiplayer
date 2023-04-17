const TIMEOUT_CONNECT = 1000;

/**
 * Sends a message to all players
 *
 * @param {string} message - The message to send
 * @return {void}
 */
export const broadcast = (message: string): void => {
    network.sendMessage(message);
};

/**
 * Sends a message to a specific player or multiple players
 *
 * @param {string} message - The message to send
 * @param {number | number[]} playerIds - One player ID or multiple player IDs to send the message to
 * @return {void}
 */
export const message = (message: string, playerIds: number | number[]): void => {
    const playersArg: number[] = Array.isArray(playerIds) ? playerIds : [playerIds as number];
    network.sendMessage(message, playersArg);
};

/**
 * Sends a message to a specific player with a timeout that matches the time to connect to the server
 *
 * @param {string} message - The message to send
 * @param {number} playerId - One player ID to send the message to
 * @return {void}
 */
export const messageOnConnect = (message: string, playerId: number): void => {
    context.setTimeout(() => network.sendMessage(message, [playerId]), TIMEOUT_CONNECT);
};
