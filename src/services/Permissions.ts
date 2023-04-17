import {ACTION_TYPE, HOOK_TYPE, TILE_ELEMENT_TYPE} from "@lib/enum";

import {getTileByCoords} from "@utils/map";

import {Logger} from "@services/Logger";
import {IPlayer} from "@src/objects/Player";
import {IRide} from "@src/objects/Ride";
import {message} from "@utils/message";

let instantiated = false;


const RESTRICTED_ACTIONS = [
    ACTION_TYPE.PARK_SET_PARAMETER,
    ACTION_TYPE.PARK_SET_NAME,
    ACTION_TYPE.PARK_SET_ENTRANCE_FEE,
    ACTION_TYPE.LAND_BUY_RIGHTS,
    ACTION_TYPE.PARK_SET_LOAN,
    ACTION_TYPE.PARK_MARKETING,
    ACTION_TYPE.PARK_SET_RESEARCH_FUNDING
];

const logger = new Logger({
    name: "Permissions"
});

/**
 * Class representing a manager for all permission functionalities.
 */
export class Permissions {

    /**
     * Construct a new Permissions and checks if none has been instantiated yet, then runs the init function
     *
     * @return {Permissions}
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
        this._subscribeToActionQuery();
    }

    /**
     * Watches for actions made by the player and handles them accordingly
     *
     * @return {void}
     */
    private _subscribeToActionQuery(): void {
        context.subscribe(HOOK_TYPE.ACTION_QUERY, (event) => {
            const {action, args} = event;
            const player = new IPlayer(event.player);

            if (player.isServer()) {
                return;
            }

            if (action === ACTION_TYPE.RIDE_CREATE || action === ACTION_TYPE.SET_CHEAT) {
                return;
            }


            if (RESTRICTED_ACTIONS.indexOf(action as ACTION_TYPE) >= 0) {
                this.handleRestrictedActions(event);
                return;
            }

            this.enhanceEvent(event);

            if ('ride' in args) {
                this.handleRideActions(event);
                return;
            }
        });
    }

    /**
     * Handles restricted actions
     *
     * @param {GameActionEventArgs} event - the event of the action
     * @return {void}
     */
    private handleRestrictedActions(event: GameActionEventArgs): void {
        const player = new IPlayer(event.player);

        if (!player || player.isAdmin()) {
            return;
        }


        event.result = {
            error: 1,
            errorTitle: 'NOT ALLOWED',
            errorMessage: 'Only admins can modify the park.'
        };

        logger.warning(`${player.networkPlayer().name} tried a restricted action: ${event.action}`);
        message('{RED}ERROR: Only admins can modify the park!', player.networkPlayer().id);

    }

    /**
     * Handles general ride actions
     *
     * @param {GameActionEventArgs} event - the event of the action
     * @return {void}
     */
    private handleRideActions(event: GameActionEventArgs): void {
        const {args} = event;
        const player = new IPlayer(event.player);
        const ride = 'ride' in args ? new IRide(args.ride as number) : null;

        if (!player || player.isAdmin() || !ride) {
            return;
        }

        if (player.isRideOwner(ride)) {
            return;
        }


        event.result = {
            error: 1,
            errorTitle: 'NOT OWNED',
            errorMessage: 'That ride belongs to another player.'
        };

        logger.warning(`${player.networkPlayer().name} tried a ride action: ${event.action}, on a ride that is not theirs.`);
        message('{RED}ERROR: {WHITE}That ride/stall doesn\'t belong to you!', player.networkPlayer().id);

    }

    /**
     * Enhances the event, because it does not hold any ride information initially.
     *
     * @param {GameActionEventArgs} event - the event of the action
     * @return {GameActionEventArgs}
     */
    private enhanceEvent(event: GameActionEventArgs): GameActionEventArgs {
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