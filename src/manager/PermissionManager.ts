import {PlayerManager} from "@manager/PlayerManager";

import {ACTION_TYPE, HOOK_TYPE, TILE_ELEMENT_TYPE} from "@lib/enum";

import {getTileByCoords} from "@utils/map";

import {Messenger} from "@services/Messenger";
import {Logger} from "@services/Logger";

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
     * logger used through the manager
     * @private
     * @type {Logger}
     */
    private logger: Logger;
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
        if (instantiated) {
            throw new Error("UtilityManager can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;

        this.messenger = options.messenger;
        this.logger = new Logger({
            name: "PermissionManager"
        });
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
        context.subscribe(HOOK_TYPE.ACTION_QUERY, (event) => {
            const {action, args, player} = event;

            console.log(player);

            if (PlayerManager.isServerPlayer(player)) {
                console.log('isServer');
                return;
            }

            if (action === ACTION_TYPE.RIDE_CREATE || action === ACTION_TYPE.SET_CHEAT) {
                return;
            }

            console.log(action);

            if (RESTRICTED_ACTIONS.indexOf(action as ACTION_TYPE) >= 0) {
                this.handleRestrictedActions(event);
                return;
            }

            const enhancedEvent = this.enhanceEvent(event);

            console.log(enhancedEvent);

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
            this.logger.warning(`${foundPlayer.name} tried a restricted action: ${event.action}`);
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

        console.log(event.action);

        if (foundPlayer && 'ride' in args && !foundPlayer.rides.some((ride) => ride === <number>args["ride"]) && !PlayerManager.isAdmin(foundPlayer)) {
            event.result = {
                error: 1,
                errorTitle: 'NOT OWNED',
                errorMessage: 'That ride belongs to another player.'
            };
            this.logger.warning(`${foundPlayer.name} tried a ride action: ${event.action}, on a ride that is not theirs.`);
            this.messenger.message('{RED}ERROR: {WHITE}That ride/stall doesn\'t belong to you!', player);
        }
    }

    /**
     * Enhances the event, because it does not hold any ride information initially.
     *
     * @private
     * @param {GameActionEventArgs} event - the event of the action
     * @return {GameActionEventArgs}
     */
    private enhanceEvent(event: GameActionEventArgs): GameActionEventArgs {
        const newEvent = event;
        const {args} = newEvent;

        console.log("enhanceEventForTrackRemove");

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