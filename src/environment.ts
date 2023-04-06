/// <reference path="../lib/environment.d.ts" />

/**
 * Returns the build configuration of the plugin.
 */
export const buildConfiguration: BuildConfiguration = __BUILD_CONFIGURATION__;

/**
 * Returns true if the current build is a production build.
 */
export const isDevelopment = (buildConfiguration === "development");