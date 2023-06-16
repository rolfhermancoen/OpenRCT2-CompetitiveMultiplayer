import { debug } from "@src/utils/logger";
import { executeAction } from "./action";
import { CHEAT_SET } from "./action/enum";
import { subscribe } from "./subscribe";
import { INTERVAL_TICK } from "./subscribe/enum";

export enum CHEAT_TYPE {
  SANDBOX_MODE,
  DISABLE_CLEARANCE_CHECKS,
  DISABLE_SUPPORT_LIMITS,
  SHOW_ALL_OPERATING_MODES,
  SHOW_VEHICLES_FROM_OTHER_TRACK_TYPES,
  DISABLE_TRAIN_LENGTH_LIMIT,
  ENABLE_CHAIN_LFT_ON_ALL_TRACK,
  FAST_LIFT_HILL,
  DISABLE_BRAKES_FAILURE,
  DISABLE_ALL_BREAKDOWNS,
  UNLOCK_ALL_PRICES,
  BUILD_IN_PAUSE_MODE,
  IGNORE_RIDE_INTENSITY,
  DISABLE_VANDALISM,
  DISABLE_LITTERING,
  NO_MONEY,
  ADD_MONEY,
  SET_MONEY,
  CLEAR_LOAN,
  SET_GUEST_PARAMETER,
  GENERATE_GUESTS,
  REMOVE_ALL_GUESTS,
  GIVE_ALL_GUESTS,
  SET_GRASS_LENGTH,
  WATER_PLANTS,
  DISABLE_PLANT_AGING,
  FIX_VANDALISM,
  REMOVE_LITTER,
  SET_STAFF_SPEED,
  RENEW_RIDES,
  MAKE_DESTRUCTIBLE,
  FIX_RIDES,
  RESET_CRASH_STATUS,
  TEN_MINUTE_INSPECTIONS,
  WIN_SCENARIO,
  FORCE_WEATHER,
  FREEZE_WEATHER,
  OPEN_CLOSE_PARK,
  HAVE_FUN,
  SET_FORCED_PARK_RATING,
  NEVER_ENDING_MARKETING,
  ALLOW_ARBITRARY_RIDE_TYPE_CHANGES,
  OWN_ALL_LAND,
  DISABLE_RIDE_VALUE_AGING,
  IGNORE_RESEARCH_STATUS,
  ENABLE_ALL_DRAWABLE_TRACK_PIECES,
  CREATE_DUCKS,
  REMOVE_DUCKS,
  ALLOW_TRACK_PLACE_INVALID_HEIGHTS,
  // Removed; this dummy exists only for deserialization parks that had it saved
  NO_CAP_ON_QUEUE_LENGTH_DUMMY,
  ALLOW_REGULAR_PATH_AS_QUEUE,
  ALLOW_SPECIAL_COLOUR_SCHEMES,
  COUNT,
}

/**
 * Sets a cheat based on multiple parameters
 *
 * @param {number} type - The message to send
 * @param {string} [param1=1] - An optional parameter
 * @param {string} [param2=0] - An optional parameter
 * @return {void}
 */
export const set = (
  type: number,
  param1: number = 1,
  param2: number = 0
): void => {
  debug(
    `[cheats] set(): ran for type: ${type} with the following parameters: ${param1} & ${param2}`
  );

  executeAction(CHEAT_SET, {
    type,
    param1,
    param2,
  });
};

/**
 * Enables some cheats to make CompetitiveMultiplayer more usable.
 *
 * @return {void}
 */
export const enableCompetitiveCheats = (): void => {
  set(CHEAT_TYPE.DISABLE_VANDALISM);
  set(CHEAT_TYPE.DISABLE_PLANT_AGING);
  set(CHEAT_TYPE.DISABLE_ALL_BREAKDOWNS);
  set(CHEAT_TYPE.DISABLE_RIDE_VALUE_AGING);
  set(CHEAT_TYPE.IGNORE_RESEARCH_STATUS);
  set(CHEAT_TYPE.CLEAR_LOAN);
  set(CHEAT_TYPE.DISABLE_LITTERING);
  set(CHEAT_TYPE.HAVE_FUN);
  set(CHEAT_TYPE.SET_FORCED_PARK_RATING, 999);

  subscribe(INTERVAL_TICK, () => {
    if (date.ticksElapsed % 10000 === 0) {
      set(CHEAT_TYPE.SET_GRASS_LENGTH);
    }
  });
};
