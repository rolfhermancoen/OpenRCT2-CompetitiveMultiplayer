import { createIPlayerById } from "@src/objects/player";
import { createIRideById } from "@src/objects/ride";
import {
  HOOK_TYPE,
  ACTION_QUERY,
  ACTION_EXECUTE,
  NETWORK_CHAT,
  NETWORK_AUTHENTICATE,
  NETWORK_JOIN,
  NETWORK_LEAVE,
  RIDE_RATINGS_CALCULATE,
  ACTION_LOCATION,
  GUEST_GENERATION,
  VEHICLE_CRASH,
  INTERVAL_TICK,
  INTERVAL_DAY,
  MAP_SAVE,
  MAP_CHANGE,
  MAP_CHANGED,
} from "./enum";
import {
  CallbackArgument,
  Event,
  GameActionError,
  GameActionEvent,
  isActionLocationEvent,
  isGameActionEvent,
  isGuestGenerationEvent,
  isNetworkAuthenticateEvent,
  isNetworkChatEvent,
  isNetworkEvent,
  isRideRatingsCalculateEvent,
  isVehicleCrashEvent,
} from "./types";
import { ACTION_TYPE } from "../action/enum";
import { Args } from "../action/types";

/**
 * Creates a setError function to set the error values
 * in the result argument on the event
 * @param event
 * @returns
 */
const createSetError = (event: { result: GameActionResult }) => {
  return (error: GameActionError): void => {
    event.result = {
      error: error.code,
      errorTitle: error.title,
      errorMessage: error.message,
      position: event.result.position,
      cost: event.result.cost,
      expenditureType: event.result.expenditureType,
    };
  };
};

/**
 * Context subscribe function
 * @param hook
 * @param callback
 * @returns
 */
export const subscribe = <H extends HOOK_TYPE>(
  hook: H,
  callback: (e: CallbackArgument<H>) => void
): IDisposable => {
  return context.subscribe(hook as HookType, (event: Event<H>) => {
    switch (hook) {
      case ACTION_QUERY:
      case ACTION_EXECUTE: {
        if (!isGameActionEvent(event)) {
          throw new Error(
            `[subscribe] subscribe(): ${hook} error in event object: ${JSON.stringify(
              event
            )}`
          );
        }

        const { player, type, action, isClientOnly, args, result } = event;

        const setError = createSetError(event);

        callback({
          player: createIPlayerById(player),
          type,
          action,
          isClientOnly,
          args,
          result,
          setError,
        } as CallbackArgument<H>);
        return;
      }
      case ACTION_LOCATION: {
        if (!isActionLocationEvent(event)) {
          throw new Error(
            `[subscribe] subscribe(): ${hook} error in event object: ${JSON.stringify(
              event
            )}`
          );
        }

        const { player, x, y, type, isClientOnly, result } = event;

        callback({
          player: createIPlayerById(player),
          x,
          y,
          type,
          isClientOnly,
          result,
        } as CallbackArgument<H>);
        return;
      }
      case NETWORK_CHAT: {
        if (!isNetworkChatEvent(event)) {
          throw new Error(
            `[subscribe] subscribe(): ${hook} error in event object: ${JSON.stringify(
              event
            )}`
          );
        }
        const { player, message } = event;

        callback({
          player: createIPlayerById(player),
          message,
        } as CallbackArgument<H>);
        return;
      }
      case NETWORK_AUTHENTICATE: {
        if (!isNetworkAuthenticateEvent(event)) {
          throw new Error(
            `[subscribe] subscribe(): ${hook} error in event object: ${JSON.stringify(
              event
            )}`
          );
        }

        const { name, ipAddress, publicKeyHash, cancel } = event;

        callback({
          name,
          ipAddress,
          publicKeyHash,
          cancel,
        } as CallbackArgument<H>);
        return;
      }
      case NETWORK_JOIN:
      case NETWORK_LEAVE: {
        if (!isNetworkEvent(event)) {
          throw new Error(
            `[subscribe] subscribe(): ${hook} error in event object: ${JSON.stringify(
              event
            )}`
          );
        }
        const { player } = event;

        callback({
          player: createIPlayerById(player),
        } as CallbackArgument<H>);
        return;
      }
      case RIDE_RATINGS_CALCULATE: {
        if (!isRideRatingsCalculateEvent(event)) {
          throw new Error(
            `[subscribe] subscribe(): ${hook} error in event object: ${JSON.stringify(
              event
            )}`
          );
        }
        const { rideId, excitement, intensity, nausea } = event;

        callback({
          ride: createIRideById(rideId),
          excitement,
          intensity,
          nausea,
        } as CallbackArgument<H>);
        return;
      }
      case GUEST_GENERATION: {
        if (!isGuestGenerationEvent(event)) {
          throw new Error(
            `[subscribe] subscribe(): ${hook} error in event object: ${JSON.stringify(
              event
            )}`
          );
        }

        const { id } = event;

        callback({
          id,
        } as CallbackArgument<H>);
        return;
      }
      case VEHICLE_CRASH: {
        if (!isVehicleCrashEvent(event)) {
          throw new Error(
            `[subscribe] subscribe(): ${hook} error in event object: ${JSON.stringify(
              event
            )}`
          );
        }

        const { id, crashIntoType } = event;

        callback({
          id,
          crashIntoType,
        } as CallbackArgument<H>);
        return;
      }
      case INTERVAL_TICK:
      case INTERVAL_DAY:
      case MAP_SAVE:
      case MAP_CHANGE:
      case MAP_CHANGED: {
        if (event) {
          throw new Error(
            `[subscribe] subscribe(): ${hook} error in event object: ${JSON.stringify(
              event
            )}`
          );
        }
        callback(undefined as CallbackArgument<H>);
        return;
      }
      default: {
        throw new Error(
          `[subscribe] subscribe(): ${hook} error with unknown hook`
        );
      }
    }
  });
};

type GameActionEventWithArgs<A extends ACTION_TYPE> = {
  args: Args<A>;
} & Omit<GameActionEvent, "args">;

/**
 *
 * @returns
 */
export const subscribeActionQuery = <A extends ACTION_TYPE>(
  actionType: A,
  callback: (event: GameActionEventWithArgs<A>) => void
): IDisposable => {
  return subscribe(ACTION_QUERY, (event) => {
    if (event.action === actionType) {
      callback(event as GameActionEventWithArgs<A>);
    }
  });
};
