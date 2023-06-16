import { IPlayer } from "@src/objects/player";
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
} from "./enum";
import { IRide } from "@src/objects/ride";

export type GameActionError = {
  code: number;
  title: string;
  message: string;
};

export type GameActionEvent<T = object> = {
  readonly player?: IPlayer;
  readonly type: number;
  readonly action: string;
  readonly isClientOnly: boolean;
  readonly args: T;
  result: GameActionResult;
  setError: (error: GameActionError) => void;
};

export type NetworkEvent = {
  readonly player?: IPlayer;
};

export type NetworkChatEvent = {
  message: string;
} & NetworkEvent;

type RideRatingsCalculateEvent = {
  readonly ride: IRide;
  excitement: number;
  intensity: number;
  nausea: number;
};

type ActionLocationEvent = {
  readonly x: number;
  readonly y: number;
  readonly player?: IPlayer;
  readonly type: number;
  readonly isClientOnly: boolean;
  result: boolean;
};

export type CallbackArgument<H extends HOOK_TYPE> = H extends
  | typeof ACTION_QUERY
  | typeof ACTION_EXECUTE
  ? GameActionEvent
  : H extends typeof NETWORK_CHAT
  ? NetworkChatEvent
  : H extends typeof NETWORK_AUTHENTICATE
  ? NetworkAuthenticateEventArgs
  : H extends typeof NETWORK_JOIN
  ? NetworkEvent
  : H extends typeof NETWORK_LEAVE
  ? NetworkEvent
  : H extends typeof RIDE_RATINGS_CALCULATE
  ? RideRatingsCalculateEvent
  : H extends typeof ACTION_LOCATION
  ? ActionLocationEvent
  : H extends typeof GUEST_GENERATION
  ? GuestGenerationArgs
  : H extends typeof VEHICLE_CRASH
  ? VehicleCrashArgs
  : undefined;

export type Event<H extends HOOK_TYPE> = H extends
  | typeof ACTION_QUERY
  | typeof ACTION_EXECUTE
  ? GameActionEventArgs
  : H extends typeof NETWORK_CHAT
  ? NetworkChatEventArgs
  : H extends typeof NETWORK_AUTHENTICATE
  ? NetworkAuthenticateEventArgs
  : H extends typeof NETWORK_JOIN
  ? NetworkEventArgs
  : H extends typeof NETWORK_LEAVE
  ? NetworkEventArgs
  : H extends typeof RIDE_RATINGS_CALCULATE
  ? RideRatingsCalculateArgs
  : H extends typeof ACTION_LOCATION
  ? ActionLocationArgs
  : H extends typeof GUEST_GENERATION
  ? GuestGenerationArgs
  : H extends typeof VEHICLE_CRASH
  ? VehicleCrashArgs
  : undefined;

export const isGameActionEvent = (
  event: Event<HOOK_TYPE>
): event is GameActionEventArgs => {
  return (
    event !== undefined &&
    "player" in event &&
    "type" in event &&
    "action" in event &&
    "isClientOnly" in event &&
    "args" in event &&
    "result" in event
  );
};

export const isActionLocationEvent = (
  event: Event<HOOK_TYPE>
): event is ActionLocationArgs => {
  return (
    event !== undefined &&
    "player" in event &&
    "x" in event &&
    "y" in event &&
    "type" in event &&
    "isClientOnly" in event &&
    "result" in event
  );
};

export const isNetworkAuthenticateEvent = (
  event: Event<HOOK_TYPE>
): event is NetworkAuthenticateEventArgs => {
  return (
    event !== undefined &&
    "name" in event &&
    "ipAddress" in event &&
    "publicKeyHash" in event &&
    "cancel" in event
  );
};

export const isNetworkEvent = (
  event: Event<HOOK_TYPE>
): event is NetworkEventArgs => {
  return event !== undefined && "player" in event;
};

export const isNetworkChatEvent = (
  event: Event<HOOK_TYPE>
): event is NetworkChatEventArgs => {
  return event !== undefined && "player" in event && "message" in event;
};

export const isRideRatingsCalculateEvent = (
  event: Event<HOOK_TYPE>
): event is RideRatingsCalculateArgs => {
  return (
    event !== undefined &&
    "rideId" in event &&
    "excitement" in event &&
    "intensity" in event &&
    "nausea" in event
  );
};

export const isGuestGenerationEvent = (
  event: Event<HOOK_TYPE>
): event is GuestGenerationArgs => {
  return event !== undefined && "player" in event;
};

export const isVehicleCrashEvent = (
  event: Event<HOOK_TYPE>
): event is VehicleCrashArgs => {
  return event !== undefined && "id" in event && "crashIntoType" in event;
};
