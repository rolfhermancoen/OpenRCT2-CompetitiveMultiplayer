import { ACTION_TYPE } from "@lib/enum";
import { ACTION_EXECUTE, contextSubscribe } from "./Context";

let instantiated = false;

/**
 * Used for all things in regards to the interactions of the players
 */
export class Interactions {
  /**
   * Construct a new Interactions and checks if none has been instantiated yet, then runs the init function
   *
   * @return {Interactions}
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
    this._subscribeToActionExecute();
  }

  /**
   * Watches for actions made by the player and handles them accordingly
   *
   * @return {void}
   */
  private _subscribeToActionExecute(): void {
    contextSubscribe(ACTION_EXECUTE, ({ player, ride, action }) => {
      if (player.isServer()) {
        return;
      }

      if (action === ACTION_TYPE.RIDE_CREATE && ride) {
        player.addRideToPlayer(ride);
        ride.setName(player);
        return;
      }

      if (action === ACTION_TYPE.RIDE_DEMOLISH && ride) {
        player.deleteRideFromPlayer(ride);
        ride.delete();
        return;
      }
    });
  }
}
