import { createIRideById } from "@src/objects/ride";
import { ACTION_TYPE } from "./enum";
import { Args, Result } from "./types";

/**
 * Query the result of running a game action. This allows you to check the outcome and validity of
 * an action without actually executing it.
 * @param action The name of the action.
 * @param args The action parameters.
 * @param callback The function to be called with the result of the action.
 * @returns
 */
export const queryAction = <A extends ACTION_TYPE>(
  action: A,
  args: Args<A>,
  callback?: (result: Result<A>) => void
): void => {
  return context.queryAction(
    action,
    args,
    (
      result:
        | GameActionResult
        | RideCreateActionResult
        | StaffHireNewActionResult
    ) => {
      if (!callback) {
        return;
      }

      const createdResult = createResult(result);

      callback(createdResult as Result<A>);
    }
  );
};

/**
 * Executes a game action. In a network game, this will send a request to the server and wait
 * for the server to reply.
 * @param action The name of the action.
 * @param args The action parameters.
 * @param callback The function to be called with the result of the action.
 * @returns
 */
export const executeAction = <A extends ACTION_TYPE>(
  action: A,
  args: Args<A>,
  callback?: (result: Result<A>) => void
): void => {
  return context.executeAction(
    action,
    args,
    (
      result:
        | GameActionResult
        | RideCreateActionResult
        | StaffHireNewActionResult
    ) => {
      if (!callback) {
        return;
      }

      const createdResult = createResult(result);

      callback(createdResult as Result<A>);
    }
  );
};

/**
 * Creates result and populates some fields with extra information
 * @param result The original result object
 * @returns The modified result objecrt
 */
const createResult = <A extends ACTION_TYPE>(
  result: GameActionResult | RideCreateActionResult | StaffHireNewActionResult
): Result<A> => {
  if ("ride" in result) {
    const ride = createIRideById(result.ride);

    return {
      error: result.error,
      errorTitle: result.errorTitle,
      errorMessage: result.errorMessage,
      position: result.position,
      cost: result.cost,
      expenditureType: result.expenditureType,
      ride,
    } as Result<A>;
  }

  if ("peep" in result) {
    return {
      error: result.error,
      errorTitle: result.errorTitle,
      errorMessage: result.errorMessage,
      position: result.position,
      cost: result.cost,
      expenditureType: result.expenditureType,
      peep: result.peep,
    } as Result<A>;
  }

  return {
    error: result.error,
    errorTitle: result.errorTitle,
    errorMessage: result.errorMessage,
    position: result.position,
    cost: result.cost,
    expenditureType: result.expenditureType,
  } as Result<A>;
};
