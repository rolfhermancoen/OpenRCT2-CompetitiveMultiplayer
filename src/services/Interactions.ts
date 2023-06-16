import { debug } from "@src/utils/logger";
import {
  GameActionEventWithArgs,
  subscribe,
  subscribeActionQuery,
} from "./subscribe";
import { NETWORK_JOIN, NETWORK_LEAVE } from "./subscribe/enum";
import { NetworkEvent } from "./subscribe/types";
import { RIDE_CREATE, RIDE_DEMOLISH } from "./action/enum";

/**
 *
 * @param callback
 * @returns
 */
export const watchForNetworkJoin = (
  callback: (e: NetworkEvent) => void
): IDisposable => {
  return subscribe(NETWORK_JOIN, (event) => {
    // player.welcome();
    debug(
      `[interactions] watchForNetworkJoin(): player joined with id: ${event.player?.id}`
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
  callback: (e: NetworkEvent) => void
): IDisposable => {
  return subscribe(NETWORK_LEAVE, (event) => {
    // player.leave();
    debug(
      `[interactions] watchForNetworkLeave(): player left with id: ${event.player?.id}`
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
  callback: (e: GameActionEventWithArgs<typeof RIDE_CREATE>) => void
): IDisposable => {
  return subscribeActionQuery(RIDE_CREATE, (event) => {
    if (event.player?.isServer()) {
      return;
    }

    debug(
      `[interactions] watchForRideCreate(): ride created with id: ${
        event.args.rideObject ?? "-"
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
  callback: (e: GameActionEventWithArgs<typeof RIDE_DEMOLISH>) => void
): IDisposable => {
  return subscribeActionQuery(RIDE_DEMOLISH, (event) => {
    if (event.player?.isServer()) {
      return;
    }
    if (event.args.ride) {
      debug(
        `[interactions] watchForRideCreate(): ride demolished with id: ${event.args.ride}`
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
