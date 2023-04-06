import {BaseManager} from "@services/BaseManager";
import {PlayerManager} from "@services/PlayerManager";
import {ACTION_TYPE, TILE_ELEMENT_TYPE} from "@lib/enum";
import {getTileByCoords} from "@utils/map";

type PermissionManagerOptions = {
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

export class PermissionManager extends BaseManager {
    private playerManager: PlayerManager;

    constructor(options: PermissionManagerOptions) {
        super();
        this.playerManager = options.playerManager;
    }

    override init(): void {
        this.watchForActions();
    }

    watchForActions(): void {
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

    handleRestrictedActions(event: GameActionEventArgs): void {
        const {player} = event;
        const foundPlayer = this.playerManager.getPlayer(player);

        if (foundPlayer && !PlayerManager.isAdmin(foundPlayer)) {
            event.result = {
                error: 1,
                errorTitle: 'NOT ALLOWED',
                errorMessage: 'Only admins can modify the park.'
            };
            this.broadcast('{RED}ERROR: Only admins can modify the park!', player);
        }
    }

    handleRideActions(event: GameActionEventArgs): void {
        const {player, args} = event;
        const foundPlayer = this.playerManager.getPlayer(player);

        if (foundPlayer && 'ride' in args && !foundPlayer.rides.some((ride) => ride === <number>args["ride"]) && !PlayerManager.isAdmin(foundPlayer)) {
            event.result = {
                error: 1,
                errorTitle: 'NOT OWNED',
                errorMessage: 'That ride belongs to another player.'
            };
            this.broadcast('{RED}ERROR: {WHITE}That ride/stall doesn\'t belong to you!', player);
        }
    }

    enhanceEventForTrackRemove(event: GameActionEventArgs): GameActionEventArgs {
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