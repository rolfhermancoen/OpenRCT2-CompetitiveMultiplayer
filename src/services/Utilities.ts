import {ACTION_TYPE, CHEAT_TYPE, HOOK_TYPE} from "@lib/enum";

import {Cheater} from "@services/Cheater";
import {Logger} from "@services/Logger";

let instantiated = false;

const logger = new Logger({
    name: "Utilities"
});

const cheater = new Cheater({
    logger,
});

/**
 * Class representing a manager for all utility functionalities.
 */
export class Utilities {
    /**
     * Construct a new UtilityManager and checks if none has been instantiated yet, then runs the init function
     *
     * @return {Utilities}
     */
    constructor() {
        if (instantiated) {
            throw new Error("UtilityManager can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;
        this._init();
    }

    /**
     * Runs functions on initialization
     *
     * @return {void}
     */
    private _init(): void {
        this._disableTrackDesigns();
        this._enableCheats();
    }

    /**
     * Disables track designs to use in-game.
     *
     * @return {void}
     */
    private _disableTrackDesigns(): void {
        context.subscribe(HOOK_TYPE.ACTION_QUERY, (event) => {
            const {player, action} = event;

            if (player === -1 && action === ACTION_TYPE.RIDE_CREATE) {
                logger.warning("Player tried to place track design.");
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
     * @return {void}
     */
    private _enableCheats(): void {
        cheater.setCheat(CHEAT_TYPE.DISABLE_VANDALISM);
        cheater.setCheat(CHEAT_TYPE.DISABLE_PLANT_AGING);
        cheater.setCheat(CHEAT_TYPE.DISABLE_ALL_BREAKDOWNS);
        cheater.setCheat(CHEAT_TYPE.DISABLE_RIDE_VALUE_AGING);
        cheater.setCheat(CHEAT_TYPE.IGNORE_RESEARCH_STATUS);
        cheater.setCheat(CHEAT_TYPE.CLEAR_LOAN);
        cheater.setCheat(CHEAT_TYPE.DISABLE_LITTERING);
        cheater.setCheat(CHEAT_TYPE.HAVE_FUN);
        cheater.setCheat(CHEAT_TYPE.SET_FORCED_PARK_RATING, 999);

        context.subscribe(HOOK_TYPE.INTERVAL_TICK, () => {
            if (date.ticksElapsed % 10000 === 0) {
                cheater.setCheat(CHEAT_TYPE.SET_GRASS_LENGTH);
            }
        });

    }
}