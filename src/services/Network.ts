import { NETWORK_JOIN, NETWORK_LEAVE, contextSubscribe } from "./Context";

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
      throw new Error(
        "UtilityManager can only be instantiated once, and needs to be injected into other classes."
      );
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
    contextSubscribe(NETWORK_JOIN, ({ player }) => {
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
    contextSubscribe(NETWORK_LEAVE, ({ player }) => {
      player.leave();
    });
  }
}
