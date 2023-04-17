import {HOOK_TYPE} from "@lib/enum";
import {IPlayer} from "@src/objects/Player";

let instantiated = false;

/**
 * Used for all things in regards to the network of the server.
 */
export class Network {
    /**
     * Construct a new Network and checks if none has been instantiated yet, then runs the init function
     *
     * @return {Network}
     */
    constructor() {
        if (instantiated) {
            throw new Error("UtilityManager can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;
        this._init();
    }

    /**
     * Initialization of the different subscriptions on the network
     *
     * @return {void}
     */
    private _init(): void {
        this._subscribeToNetworkJoin();
        this._subscribeToNetworkLeave();
    }

    /**
     * Watches for players to join the network and welcomes them
     *
     * @return {void}
     */
    private _subscribeToNetworkJoin(): void {
        context.subscribe(HOOK_TYPE.NETWORK_JOIN, ({player: playerId}) => {
            const player = new IPlayer(playerId);
            player.welcome();
        });
    }

    /**
     * Watches for players leaving the network, and fires the leave method on the player,
     * which handles side effects of the player leaving.
     *
     * @return {void}
     */
    private _subscribeToNetworkLeave(): void {
        context.subscribe(HOOK_TYPE.NETWORK_LEAVE, ({player: playerId}) => {
            const player = new IPlayer(playerId);
            player.leave();
        });
    }
}