import {PlayerManager} from "@src/manager/PlayerManager";
import {ACTION_TYPE, TILE_ELEMENT_TYPE} from "@lib/enum";
import {getTileByCoords} from "@utils/map";
import {Messenger} from "@services/Messenger";

let instantiated = false;

type PermissionManagerOptions = {
    messenger: Messenger
    playerManager: PlayerManager
};

const RESTRICTED_ACTIONS = [
    ACTION_TYPE.PARK_SET_PARAMETER,
    ACTION_TYPE.PARK_SET_NAME,
    ACTION_TYPE.PARK_SET_ENTRANCE_FEE,
    ACTION_TYPE.LAND_BUY_RIGHTS,
    ACTION_TYPE.PARK_SET_LOAN,
    ACTION_TYPE.PARK_MARKETING,
    ACTION_TYPE.PARK_SET_RESEARCH_FUNDING
];

/**
 * Class representing a manager for all permission functionalities.
 * @class
 */
export class PermissionManager {
    /**
     * messenger used throughout the manager
     * @private
     * @type {Messenger}
     */
    private messenger: Messenger;
    /**
     * a manager which allows the PermissionManager to alter and get players
     * @private
     * @type {PlayerManager}
     */
    private playerManager: PlayerManager;

    /**
     * Construct a new PermissionManager and checks if none has been instantiated yet, then runs the init function
     *
     * @public
     * @param {PermissionManagerOptions} options - the options provided when instantiating
     * @return {PermissionManager}
     */
    constructor(options: PermissionManagerOptions) {
        if(instantiated) {
            throw new Error("UtilityManager can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;

        this.messenger = options.messenger;
        this.playerManager = options.playerManager;
        this.init();
    }

    /**
     * Runs functions on initialization
     *
     * @private
     * @return {void}
     */
    private init(): void {
        this.watchForActions();
    }

    /**
     * Watches for actions made by the player and handles them accordingly
     *
     * @private
     * @return {void}
     */
    private watchForActions(): void {
        context.subscribe("action.query", (event) => {
            const {action, args, player} = event;

            if(PlayerManager.isServerPlayer(player)) {
                return;
            }

            if (action === ACTION_TYPE.RIDE_CREATE) {
                return;
            }

            if (RESTRICTED_ACTIONS.indexOf(action as ACTION_TYPE) >= 0) {
                this.handleRestrictedActions(event);
                return;
            }

            if (action === ACTION_TYPE.TRACK_REMOVE) {
                event = this.enhanceEventForTrackRemove(event);
            }

            if ('ride' in args) {
                this.handleRideActions(event);
                return;
            }
        });
    }

    /**
     * Handles restricted actions
     *
     * @private
     * @param {GameActionEventArgs} event - the event of the action
     * @return {void}
     */
    private handleRestrictedActions(event: GameActionEventArgs): void {
        const {player} = event;
        const foundPlayer = this.playerManager.getPlayer(player);

        if (foundPlayer && !PlayerManager.isAdmin(foundPlayer)) {
            event.result = {
                error: 1,
                errorTitle: 'NOT ALLOWED',
                errorMessage: 'Only admins can modify the park.'
            };
            this.messenger.message('{RED}ERROR: Only admins can modify the park!', player);
        }
    }

    /**
     * Handles general ride actions
     *
     * @private
     * @param {GameActionEventArgs} event - the event of the action
     * @return {void}
     */
    private handleRideActions(event: GameActionEventArgs): void {
        const {player, args} = event;
        const foundPlayer = this.playerManager.getPlayer(player);

        if (foundPlayer && 'ride' in args && !foundPlayer.rides.some((ride) => ride === <number>args["ride"]) && !PlayerManager.isAdmin(foundPlayer)) {
            event.result = {
                error: 1,
                errorTitle: 'NOT OWNED',
                errorMessage: 'That ride belongs to another player.'
            };
            this.messenger.message('{RED}ERROR: {WHITE}That ride/stall doesn\'t belong to you!', player);
        }
    }

    /**
     * Enhances the event for track_remove, because it does not hold any ride information initially.
     *
     * @private
     * @param {GameActionEventArgs} event - the event of the action
     * @return {GameActionEventArgs}
     */
    private enhanceEventForTrackRemove(event: GameActionEventArgs): GameActionEventArgs {
        const newEvent = event;
        const {args} = newEvent;

        if (!('x' in args) || !('y' in args) || !('z' in args) || !('ride' in newEvent.args)) {
            return newEvent;
        }

        const tile = getTileByCoords(args["x"] as number, args["y"] as number);

        for (let i = 0; i < tile.numElements; i++) {
            const element = tile.getElement(i);
            if (element.type === TILE_ELEMENT_TYPE.TRACK && element.baseZ === args["z"] as number) {
                newEvent.args["ride"] = element.ride;
                break;
            }
        }

        return newEvent;
    }
}