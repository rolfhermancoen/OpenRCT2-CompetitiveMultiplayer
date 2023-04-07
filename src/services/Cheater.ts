import {ACTION_TYPE} from "@lib/enum";

let instantiated = false;

/**
 * Class representing a way to use cheats.
 * @class
 */
export class Cheater {
    /**
     * Construct a new Cheater and checks if none has been instantiated yet
     *
     * @public
     */
    constructor() {
        if(instantiated) {
            throw new Error("Cheater can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;
    }
    /**
     * Sets a cheat based on multiple parameters
     *
     * @public
     * @param {number} type - The message to send
     * @param {string} [param1=1] - An optional parameter
     * @param {string} [param2=0] - An optional parameter
     * @return {void}
     */
    public setCheat(type: number, param1: number = 1, param2: number = 0): void {
        context.executeAction(ACTION_TYPE.CHEAT_SET, {
            type,
            param1,
            param2
        });
    }
}