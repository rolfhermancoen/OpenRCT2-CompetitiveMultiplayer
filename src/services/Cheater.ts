import {ACTION_TYPE} from "@lib/enum";
import {Logger} from "@services/Logger";


type CheaterOptions = {
    logger: Logger
};

/**
 * Class representing a way to use cheats.
 * @class
 */
export class Cheater {
    /**
     * logger used through the manager
     * @private
     * @type {Logger}
     */
    private logger: Logger;

    /**
     * Construct a new Cheater
     *
     * @public
     */
    constructor(options: CheaterOptions) {
        this.logger = options.logger;
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
        this.logger.debug(`${ACTION_TYPE.SET_CHEAT} ran for type: ${type} with the following parameters: ${param1} & ${param2}`);

        context.executeAction(ACTION_TYPE.SET_CHEAT, {
            type,
            param1,
            param2
        });
    }

    /**
     * Checks if a cheat is enabled
     *
     * @public
     * @param {keyof Cheats} cheat - The cheat to validate
     * @return {boolean}
     */
    public isEnabled(cheat: keyof Cheats): boolean {
        return cheats[cheat as keyof Cheats];
    }
}