import { debug } from "@src/utils/logger";
import { RIDE_CREATE, RIDE_DEMOLISH } from "./actions";
import {
  ACTION_EXECUTE,
  NETWORK_JOIN,
  subscribe,
  NetworkEventArguments,
  NETWORK_LEAVE,
  GameActionEvent,
} from "./subscribeold";

/**
 *
 * @param callback
 * @returns
 */
export const watchForNetworkJoin = (
  callback: (e: NetworkEventArguments) => void
): IDisposable => {
  return subscribe(NETWORK_JOIN, null, (event) => {
    // player.welcome();
    debug(
      `[interactions] watchForNetworkJoin(): player joined with id: ${event.player.id}`
    );
    callback(event);
  });
};

/**
 *
 * @param callback
 * @returns
 */
export const watchForNetworkLeave = (
  callback: (e: NetworkEventArguments) => void
): IDisposable => {
  return subscribe(NETWORK_LEAVE, null, (event) => {
    // player.leave();
    debug(
      `[interactions] watchForNetworkLeave(): player left with id: ${event.player.id}`
    );
    callback(event);
  });
};

/**
 *
 * @param callback
 * @returns
 */
export const watchForRideCreate = (
  callback: (e: GameActionEvent<typeof RIDE_CREATE>) => void
): IDisposable => {
  return subscribe(ACTION_EXECUTE, RIDE_CREATE, (event) => {
    if (event.player?.isServer()) {
      return;
    }

    debug(
      `[interactions] watchForRideCreate(): ride created with id: ${
        event.ride?.id ?? "-"
      }`
    );
    callback(event);
  });
};

/**
 *
 * @param callback
 * @returns
 */
export const watchForRideDemolish = (
  callback: (e: GameActionEvent<typeof RIDE_DEMOLISH>) => void
): IDisposable => {
  return subscribe(ACTION_EXECUTE, RIDE_DEMOLISH, (event) => {
    if (event.player?.isServer()) {
      return;
    }
    if (event.ride) {
      debug(
        `[interactions] watchForRideCreate(): ride demolished with id: ${event.ride.id}`
      );
      callback(event);
    }
  });
};

// OLD FUCNTION NEEDS TO MOVE
// private _subscribeToActionExecute(): void {
//     subscribe(ACTION_EXECUTE, ({ player, ride, action }) => {
//       if (player.isServer()) {
//         return;
//       }

//       if (action === RIDE_CREATE && ride) {
//         player.addRideToPlayer(ride);
//         ride.setName(player);
//         return;
//       }

//       if (action === RIDE_DEMOLISH && ride) {
//         player.deleteRideFromPlayer(ride);
//         ride.delete();
//         return;
//       }
//     });
//   }
