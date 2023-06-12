import { IPlayer } from "@src/objects/Player";
import { IRide } from "@src/objects/Ride";

export enum CONTEXT_SUBSCRIBE_HOOK_TYPE {
  ACTION_QUERY = "action.query",
  ACTION_EXECUTE = "action.execute",
  INTERVAL_TICK = "interval.tick",
  INTERVAL_DAY = "interval.day",
  NETWORK_CHAT = "network.chat",
  NETWORK_AUTHENTICATE = "network.authenticate",
  NETWORK_ACTION = "network.action",
  NETWORK_JOIN = "network.join",
  NETWORK_LEAVE = "network.leave",
  RIDE_RATINGS_CALCULATE = "ride.ratings.calculate",
  ACTION_LOCATION = "action.location",
  VEHICLE_CRASH = "vehicle.crash",
  MAP_CHANGE = "map.change",
  MAP_CHANGED = "map.changed",
  MAP_SAVE = "map.save",
  GUEST_GENERATION = "guest.generation",
}

export const {
  ACTION_QUERY,
  ACTION_EXECUTE,
  INTERVAL_TICK,
  INTERVAL_DAY,
  NETWORK_CHAT,
  NETWORK_AUTHENTICATE,
  NETWORK_ACTION,
  NETWORK_JOIN,
  NETWORK_LEAVE,
  RIDE_RATINGS_CALCULATE,
  ACTION_LOCATION,
  VEHICLE_CRASH,
  MAP_CHANGE,
  MAP_CHANGED,
  MAP_SAVE,
  GUEST_GENERATION,
} = CONTEXT_SUBSCRIBE_HOOK_TYPE;

type GameActionEventArguments = {
  readonly player: IPlayer;
  readonly ride?: IRide;
} & Omit<GameActionEventArgs, "player">;

type NetworkChatEventArguments = {
  readonly message: string;
} & GameActionEventArguments;

type NetworkAuthenticateEventArguments = NetworkAuthenticateEventArgs;

type NetworkEventArguments = {
  readonly player: IPlayer;
};

type RideRatingsCalculateArguments = {
  readonly ride: IRide;
} & Omit<RideRatingsCalculateArgs, "rideId">;

type ActionLocationArguments = {
  readonly player: IPlayer;
} & Omit<ActionLocationArgs, "player">;

type GuestGenerationArguments = GuestGenerationArgs;

type VehicleCrashArguments = VehicleCrashArgs;

type CallbackArgument<T extends CONTEXT_SUBSCRIBE_HOOK_TYPE> =
  T extends typeof ACTION_QUERY
    ? GameActionEventArguments
    : T extends typeof ACTION_EXECUTE
    ? GameActionEventArguments
    : T extends typeof INTERVAL_TICK
    ? undefined
    : T extends typeof INTERVAL_DAY
    ? undefined
    : T extends typeof NETWORK_CHAT
    ? NetworkChatEventArguments
    : T extends typeof NETWORK_AUTHENTICATE
    ? NetworkAuthenticateEventArguments
    : T extends typeof NETWORK_JOIN
    ? NetworkEventArguments
    : T extends typeof NETWORK_LEAVE
    ? NetworkEventArguments
    : T extends typeof RIDE_RATINGS_CALCULATE
    ? RideRatingsCalculateArguments
    : T extends typeof ACTION_LOCATION
    ? ActionLocationArguments
    : T extends typeof GUEST_GENERATION
    ? GuestGenerationArguments
    : T extends typeof VEHICLE_CRASH
    ? VehicleCrashArguments
    : T extends typeof MAP_SAVE
    ? undefined
    : T extends typeof MAP_CHANGE
    ? undefined
    : T extends typeof MAP_CHANGED
    ? undefined
    : T extends typeof NETWORK_ACTION
    ? undefined
    : never;

const getPlayer = (event: { player: number }): IPlayer => {
  const { player } = event as GameActionEventArgs;
  return new IPlayer(player);
};

const getRide = (event: { rideId: number }): IRide => {
  const { rideId } = event as RideRatingsCalculateArgs;
  return new IRide(rideId);
};

export const contextSubscribe = <T extends CONTEXT_SUBSCRIBE_HOOK_TYPE>(
  hook: T,
  callback: (e: CallbackArgument<T>) => void
): IDisposable => {
  if (hook === ACTION_QUERY || hook === ACTION_EXECUTE) {
    return context.subscribe(hook as HookType, (e: GameActionEventArgs) => {
      const player = getPlayer(e);
      const ride =
        "ride" in e.result ? new IRide(e.result.ride as number) : undefined;
      callback({
        player,
        ride,
        action: e.action,
        type: e.type,
        isClientOnly: e.isClientOnly,
        args: e.args,
      } as CallbackArgument<T>);
    });
  }

  if (hook === NETWORK_CHAT) {
    return context.subscribe(hook as HookType, (e: NetworkChatEventArgs) => {
      const player = getPlayer(e);
      callback({ player, message: e.message } as CallbackArgument<T>);
    });
  }

  if (hook === NETWORK_AUTHENTICATE) {
    return context.subscribe(
      hook as HookType,
      (e: NetworkAuthenticateEventArgs) => {
        callback(e as CallbackArgument<T>);
      }
    );
  }

  if (hook === NETWORK_JOIN || hook == NETWORK_LEAVE) {
    return context.subscribe(hook as HookType, (e: NetworkEventArgs) => {
      const player = getPlayer(e);
      callback({ player } as CallbackArgument<T>);
    });
  }

  if (hook === RIDE_RATINGS_CALCULATE) {
    return context.subscribe(
      hook as HookType,
      (e: RideRatingsCalculateArgs) => {
        const ride = getRide(e);
        callback({
          ride,
          excitement: e.excitement,
          intensity: e.intensity,
          nausea: e.nausea,
        } as CallbackArgument<T>);
      }
    );
  }

  if (hook === ACTION_LOCATION) {
    return context.subscribe(hook as HookType, (e: ActionLocationArgs) => {
      const player = getPlayer(e);
      callback({
        player,
        x: e.x,
        y: e.y,
        type: e.type,
        isClientOnly: e.isClientOnly,
        result: e.result,
      } as CallbackArgument<T>);
    });
  }

  if (hook === GUEST_GENERATION) {
    return context.subscribe(hook as HookType, (e: GuestGenerationArgs) => {
      callback(e as CallbackArgument<T>);
    });
  }

  if (hook === VEHICLE_CRASH) {
    return context.subscribe(hook as HookType, (e: VehicleCrashArgs) => {
      callback(e as CallbackArgument<T>);
    });
  }

  if (
    hook === INTERVAL_TICK ||
    hook === INTERVAL_DAY ||
    hook === MAP_SAVE ||
    hook === MAP_CHANGE ||
    hook === MAP_CHANGED
  ) {
    return context.subscribe(hook as HookType, () =>
      callback(undefined as CallbackArgument<T>)
    );
  }

  throw new Error("Incorrent hook used in contextSubscribe: " + hook);
};
