import { watchForRideCreate } from "./interactions";
import { warning } from "@src/utils/logger";
import { message } from "@src/utils/message";
import { subscribe } from "./subscribe";
import { ACTION_QUERY } from "./subscribe/enum";
import {
  ACTION_TYPE,
  LAND_BUY_RIGHTS,
  PARK_MARKETING,
  PARK_SET_ENTRANCE_FEE,
  PARK_SET_LOAN,
  PARK_SET_NAME,
  PARK_SET_PARAMETER,
  PARK_SET_RESEARCH_FUNDING,
} from "./action/enum";

const RESTRICTED_ACTIONS = [
  PARK_SET_PARAMETER,
  PARK_SET_NAME,
  PARK_SET_ENTRANCE_FEE,
  LAND_BUY_RIGHTS,
  PARK_SET_LOAN,
  PARK_MARKETING,
  PARK_SET_RESEARCH_FUNDING,
];

/**
 *
 */
export const restrictActions = (): void => {
  subscribe(ACTION_QUERY, (event) => {
    const { action, player } = event;
    if (!player || player.isServer() || player.isAdmin()) {
      return;
    }

    if (RESTRICTED_ACTIONS.indexOf(action as ACTION_TYPE) >= 0) {
      event.result = {
        error: 1,
        errorTitle: "NOT ALLOWED",
        errorMessage: "Only admins can modify the park.",
      };

      warning(
        `${player.networkPlayer().name} tried a restricted action: ${
          event.action
        }`
      );
      message(
        "{RED}ERROR: Only admins can modify the park!",
        player.networkPlayer().id
      );
    }
  });
};

/**
 *
 */
// export const restrictRideActions = (): void => {
//   subscribe(ACTION_QUERY, (event) => {
//     const { player } = event;
//     if (!("ride" in event.args) || !player || player.isServer() || player.isAdmin()) {
//       return;
//     }

//     if (player.isRideOwner(event.args.ride as)) {
//       return;
//     }

//     event.result = {
//       error: 1,
//       errorTitle: "NOT OWNED",
//       errorMessage: "That ride belongs to another player.",
//     };

//     warning(
//       `${player.networkPlayer().name} tried a ride action: ${
//         event.action
//       }, on a ride that is not theirs.`
//     );
//     message(
//       "{RED}ERROR: {WHITE}That ride/stall doesn't belong to you!",
//       player.networkPlayer().id
//     );
//   });
// };

/**
 *
 */
export const disableTrackDesigns = (): void => {
  watchForRideCreate((event) => {
    if (event.player?.isTrackDesigner()) {
      event.result = {
        error: 1,
        errorTitle: "NO PLAYER INDEX",
        errorMessage: "Player is -1",
      };
    }
  });
};
