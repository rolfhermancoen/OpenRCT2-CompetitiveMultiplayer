// DOES WORK
// const subscribeActionQuery = (): void => {
//   context.subscribe("action.query", (e: GameActionEventArgs) => {
//     e.result = {
//       error: 1,
//       errorTitle: "NO PLAYER INDEX",
//       errorMessage: "Player is -1",
//     };
//   });
// };

// import { subscribeActionQuery } from "./services/subscribe/action-query";

// import { RIDE_CREATE } from "./services/actions";
// import { ACTION_QUERY, subscribe } from "./services/subscribeold";

// WONT WORK
// const subscribeActionQueryWithReturn = (): IDisposable => {
//   return context.subscribe("action.query", (e: GameActionEventArgs) => {
//     e.result = {
//       error: 1,
//       errorTitle: "NO PLAYER INDEX",
//       errorMessage: "Player is -1",
//     };
//   });
// };

// DOES WORK
// const subscribeActionQueryWithDispose = (): IDisposable => {
//   const {dispose} = context.subscribe("action.query", (e: GameActionEventArgs) => {
//     e.result = {
//       error: 1,
//       errorTitle: "NO PLAYER INDEX",
//       errorMessage: "Player is -1",
//     };
//   });

//   return {
//     dispose
//   };
// };

export const start = (): void => {
  if (network.mode !== "server") {
    return;
  }
  //   subscribeActionQueryWithReturn();
  // subscribe(ACTION_QUERY, RIDE_CREATE, (e) => {
  //   e.result = {
  //     error: 1,
  //     errorTitle: "NO PLAYER INDEX",
  //     errorMessage: "Player is -1",
  //   };
  // });

  // subscribeActionQuery(ACTION_TYPE.BALLOON_PRESS, () => {
  //   // do nothing
  // });

  // DOES WORK
  //   context.subscribe("action.query", (e: GameActionEventArgs) => {
  //     e.result = {
  //       error: 1,
  //       errorTitle: "NO PLAYER INDEX",
  //       errorMessage: "Player is -1",
  //     };
  //   });
};
