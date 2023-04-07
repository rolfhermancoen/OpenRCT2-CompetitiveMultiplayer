import {ACTION_TYPE, CHEAT_TYPE, HOOK_TYPE} from "@lib/enum";

import {Cheater} from "@services/Cheater";
import {Logger} from "@services/Logger";

let instantiated = false;

/**
 * Class representing a manager for all utility functionalities.
 * @class
 */
export class UtilityManager {
    /**
     * logger used through the manager
     * @private
     * @readonly
     * @type {Logger}
     */
    private readonly logger: Logger;
    /**
     * cheater service used to cheat with
     * @private
     * @readonly
     * @type {Cheater}
     */
    private readonly cheater: Cheater;

    /**
     * Construct a new UtilityManager and checks if none has been instantiated yet, then runs the init function
     *
     * @public
     * @return {UtilityManager}
     */
    constructor() {
        if (instantiated) {
            throw new Error("UtilityManager can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;

        this.logger = new Logger({
            name: "UtilityManager"
        });

        this.cheater = new Cheater({
            logger: this.logger,
        });

        this.init();
    }

    /**
     * Runs functions on initialization
     *
     * @private
     * @return {void}
     */
    private init(): void {
        this.disableTrackDesigns();
        this.enableCheats();
    }

    /**
     * Disables track designs to use in-game.
     *
     * @private
     * @return {void}
     */
    private disableTrackDesigns(): void {
        context.subscribe(HOOK_TYPE.ACTION_QUERY, (event) => {
            const {player, action} = event;

            if (player === -1 && action === ACTION_TYPE.RIDE_CREATE) {
                this.logger.warning("Player tried to place track design.");
                event.result = {
                    error: 1,
                    errorTitle: 'NO PLAYER INDEX',
                    errorMessage: 'Player is -1'
                };


            }
        });
    }

    /**
     * Enables some cheats to make CompetitiveMultiplayer more usable.
     *
     * @private
     * @return {void}
     */
    private enableCheats(): void {
        this.cheater.setCheat(CHEAT_TYPE.DISABLE_VANDALISM);
        this.cheater.setCheat(CHEAT_TYPE.DISABLE_PLANT_AGING);
        this.cheater.setCheat(CHEAT_TYPE.DISABLE_ALL_BREAKDOWNS);
        this.cheater.setCheat(CHEAT_TYPE.DISABLE_RIDE_VALUE_AGING);
        this.cheater.setCheat(CHEAT_TYPE.IGNORE_RESEARCH_STATUS);
        this.cheater.setCheat(CHEAT_TYPE.CLEAR_LOAN);
        this.cheater.setCheat(CHEAT_TYPE.DISABLE_LITTERING);
        this.cheater.setCheat(CHEAT_TYPE.HAVE_FUN);
        this.cheater.setCheat(CHEAT_TYPE.SET_FORCED_PARK_RATING, 999);

        context.subscribe(HOOK_TYPE.INTERVAL_TICK, () => {
            if (date.ticksElapsed % 10000 === 0) {
                this.cheater.setCheat(CHEAT_TYPE.SET_GRASS_LENGTH);
            }
        });

    }
}