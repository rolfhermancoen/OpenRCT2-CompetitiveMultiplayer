import {ACTION_TYPE, HOOK_TYPE} from "@lib/enum";
import {Cheater} from "@services/Cheater";

let instantiated = false;

type UtilityManagerOptions = {
    cheater: Cheater
};

/**
 * Class representing a manager for all utility functionalities.
 * @class
 */
export class UtilityManager {
    /**
     * cheater service used to cheat with
     * @private
     * @type {Cheater}
     */
    private cheater: Cheater;

    /**
     * Construct a new UtilityManager and checks if none has been instantiated yet, then runs the init function
     *
     * @public
     * @param {UtilityManagerOptions} options - the options provided when instantiating
     * @return {UtilityManager}
     */
    constructor(options: UtilityManagerOptions) {
        if(instantiated) {
            throw new Error("UtilityManager can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;

        this.cheater = options.cheater;
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
        // disable vandalism
        this.cheater.setCheat(13);

        // disable plants aging
        this.cheater.setCheat(25);

        // disable all breakdowns
        this.cheater.setCheat(9);

        // rides don't decrease in value over time
        this.cheater.setCheat(43);

        // unlock all rides
        this.cheater.setCheat(44);

        // clear grass every 1000 ticks
        context.subscribe('interval.tick', () => {
            if (date.ticksElapsed % 10000 === 0) {
                this.cheater.setCheat(23);
            }
        });
    }
}