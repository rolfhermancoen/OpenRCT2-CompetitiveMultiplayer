import {ACTION_TYPE, HOOK_TYPE} from "@lib/enum";
import {IPlayer} from "@src/objects/Player";
import {IRide} from "@src/objects/Ride";

let instantiated = false;

/**
 * Used for all things in regards to the interactions of the players
 */
export class Interactions {
    /**
     * Construct a new Interactions and checks if none has been instantiated yet, then runs the init function
     *
     * @return {Interactions}
     */
    constructor() {
        if (instantiated) {
            throw new Error("UtilityManager can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;
        this._init();
    }

    /**
     * Initialization of the different subscriptions on the network
     *
     * @return {void}
     */
    private _init(): void {
        this._subscribeToActionExecute();
    }

    /**
     * Watches for actions made by the player and handles them accordingly
     *
     * @return {void}
     */
    private _subscribeToActionExecute(): void {
        context.subscribe(HOOK_TYPE.ACTION_EXECUTE, (event) => {
            const player = new IPlayer(event.player);

            if (player.isServer()) {
                return;
            }

            const ride = 'ride' in event.result ? new IRide(event.result.ride as number) : null;

            if (event.action === ACTION_TYPE.RIDE_CREATE && ride) {
                player.addRideToPlayer(ride);
                ride.setName(player);
                return;
            }

            if (event.action === ACTION_TYPE.RIDE_DEMOLISH && ride) {
                player.deleteRideFromPlayer(ride);
                ride.delete();
                return;
            }
        });
    }
}