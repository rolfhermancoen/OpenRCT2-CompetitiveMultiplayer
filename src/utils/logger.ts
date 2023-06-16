import * as Environment from "@src/environment";

/**
 * The available levels of logging.
 */
type LogLevel = "debug" | "warning" | "error";

/**
 * Returns true if Duktape is available, or false if not.
 */
const isDuktapeAvailable = typeof Duktape !== "undefined";

/**
 * Enable stack-traces on errors in development mode.
 */
if (Environment.isDevelopment && isDuktapeAvailable) {
  Duktape.errCreate = function onError(error): Error {
    error.message += `\r\n${stacktrace()}`;
    return error;
  };
}

/**
 * Prints a message with the specified logging and plugin identifier.
 *
 * @param {LogLevel} level - the level of logging
 * @param {unknown[]} messages - the messages to print
 * @return {void}
 */
export const print = (level: LogLevel, messages: unknown[]): void => {
  console.log(`<CM/${level}> ${messages.join(" ")}`);
};

/**
 * Prints a debug message if the plugin is run in development mode.
 *
 * @param {...unknown[]} messages - the messages to print
 * @return {void}
 */
export const debug = (...messages: unknown[]): void => {
  if (Environment.isDevelopment) {
    print("debug", messages);
  }
};

/**
 * Prints a warning message to the console.
 *
 * @param {...unknown[]} messages - the messages to print
 * @return {void}
 */
export const warning = (...messages: unknown[]): void => {
  print("warning", messages);
};

/**
 * Prints an error message to the console and an additional stacktrace
 * if the plugin is run in development mode.
 *
 * @param {...unknown[]} messages - the messages to print
 * @return {void}
 */
export const error = (...messages: unknown[]): void => {
  if (Environment.isDevelopment) {
    messages.push(`\r\n${stacktrace()}`);
  }
  print("error", messages);
};

/**
 * Prints an error message to the console and an additional stacktrace
 * if the assert fails and the plugin is run in development mode.
 *
 * @param {boolean} condition - the condition to assert
 * @param {...unknown[]} messages - the messages to print
 * @return {void}
 */
export const assert = (condition: boolean, ...messages: unknown[]): void => {
  if (Environment.isDevelopment && !condition) {
    throw Error(`Assertion failed! ${messages.join(" ")}`);
  }
  return <never>0;
};

/**
 * Returns the current call stack as a string.
 *
 * @return {string}
 */
export const stacktrace = (): string => {
  if (!isDuktapeAvailable) {
    return "  (stacktrace unavailable)\r\n";
  }

  const depth = -4; // skips act(), stacktrace() and the calling method.
  let entry: DukStackEntry,
    result = "";

  for (let i = depth; (entry = Duktape.act(i)); i--) {
    const functionName = entry.function.name;
    const prettyName = functionName ? `${functionName}()` : "<anonymous>";

    result += `   -> ${prettyName}: line ${entry.lineNumber}\r\n`;
  }
  return result;
};
