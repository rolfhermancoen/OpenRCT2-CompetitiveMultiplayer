const TIMEOUT_CONNECT = 1000;
let instantiated = false;

/**
 * Class representing messenger.
 * @class
 */
export class Messenger {
    /**
     * Construct a new Messenger and checks if none has been instantiated yet
     *
     * @public
     */
    constructor() {
        if(instantiated) {
            throw new Error("Messenger can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;
    }
    /**
     * Sends a message to all players
     *
     * @public
     * @param {string} message - The message to send
     * @return {void}
     */
    public broadcast(message: string): void {
        network.sendMessage(message);
    }

    /**
     * Sends a message to a specific player or multiple players
     *
     * @public
     * @param {string} message - The message to send
     * @param {number | number[]} playerIds - One player ID or multiple player IDs to send the message to
     * @return {void}
     */
    public message(message: string, playerIds: number | number[]): void {
        const playersArg: number[] = Array.isArray(playerIds) ? playerIds : [playerIds as number];
        network.sendMessage(message, playersArg);
    }

    /**
     * Sends a message to a specific player with a timeout that matches the time to connect to the server
     *
     * @public
     * @param {string} message - The message to send
     * @param {number} playerId - One player ID to send the message to
     * @return {void}
     */
    public messageOnConnect(message: string, playerId: number): void {
        context.setTimeout(() => network.sendMessage(message, [playerId]), TIMEOUT_CONNECT);
    }


}