import {PlayerManager} from "@manager/PlayerManager";

import {ACTION_TYPE, HOOK_TYPE} from "@lib/enum";

import {find} from "@utils/array";

import {Storage} from "@services/Storage";
import {Logger} from "@services/Logger";

let instantiated = false;

type SRide = {
    id: number
    playerHash: string;
    previousTotalProfit: number
};

export type IRide = SRide & Pick<Ride, "name" | "totalProfit" | "type">;

type RideManagerOptions = {
    playerManager: PlayerManager
};

/**
 * Class representing a manager for all ride functionalities.
 * @class
 */
export class RideManager {
    /**
     * a manager which allows the RideManager to alter and get players
     * @private
     * @type {PlayerManager}
     */
    private playerManager: PlayerManager;

    /**
     * logger used through the manager
     * @private
     * @type {Logger}
     */
    private logger: Logger;

    /**
     * storage used throughout the manager
     * @private
     * @type {Storage}
     */
    private storage: Storage;

    /**
     * Construct a new RideManager and checks if none has been instantiated yet, then runs the init function
     *
     * @public
     * @param {RideManagerOptions} options - the options provided when instantiating
     * @return {RideManager}
     */
    constructor(options: RideManagerOptions) {
        if (instantiated) {
            throw new Error("UtilityManager can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;

        this.playerManager = options.playerManager;

        this.logger = new Logger({
            name: "RideManager"
        });

        this.storage = new Storage({
            name: "RideManager"
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
        this.watchForActions();
    }

    /**
     * Watches for actions made by the player and handles them accordingly
     *
     * @private
     * @return {void}
     */
    private watchForActions(): void {
        context.subscribe(HOOK_TYPE.ACTION_EXECUTE, (event) => {
            const {player, action} = event;
            if (PlayerManager.isServerPlayer(player)) {
                return;
            }

            if (action === ACTION_TYPE.RIDE_CREATE) {
                this.handleRideCreateAction(event);
                return;
            }

            if (action === ACTION_TYPE.RIDE_DEMOLISH) {
                this.handleRideDemolishAction(event);
                return;
            }
        });
    }

    /**
     * Handles the ride_create action by the player, where it forwards it to the createRide function.
     *
     * @private
     * @param {GameActionEventArgs} event - the event given by the action of the player
     * @return {void}
     */
    private handleRideCreateAction({player, result}: GameActionEventArgs): void {
        if (!('ride' in result)) {
            return;
        }
        this.createRide(player, <number>result['ride']);
    }

    /**
     * Handles the ride_demolish action by the player, where it forwards it to the demolishRide function.
     *
     * @private
     * @param {GameActionEventArgs} event - the event given by the action of the player
     * @return {void}
     */
    private handleRideDemolishAction({args}: GameActionEventArgs): void {
        if (!('ride' in args)) {
            return;
        }
        this.demolishRide(<number>args['ride']);
    }

    /**
     * Gets the ride from both the map and storage
     *
     * @public
     * @param {number} id - the id to find the ride
     * @return {IRide | null}
     */
    public getRide(id: number): IRide | null {
        if (id === -1) {
            return null;
        }

        const mRide = this.getMapRide(id);
        const sRide = this.getStorageRide(id);

        if (!mRide || !sRide) {
            return null;
        }


        return RideManager.parseRide(mRide, sRide);
    }

    /**
     * Gets the ride from the map
     *
     * @private
     * @param {number} id - the id to find the ride
     * @return {Ride | null}
     */
    private getMapRide(id: number): Ride | null {
        const mRide = find(map.rides, ((nRide) => nRide.id === id));

        if (!mRide) {
            this.logger.error(`Could not find mRide with id: ${id}`);
            return null;
        }

        return mRide;
    }

    /**
     * Gets the ride from the storage
     *
     * @private
     * @param {number} id - the id to find the ride
     * @return {SRide | null}
     */
    private getStorageRide(id: number): SRide | null {
        const sRides = this.getAllStorageRides();
        return find(sRides, (ride) => ride.id === id);
    }

    /**
     * Gets all the rides from storage
     *
     * @private
     * @return {SRide[] | null}
     */
    private getAllStorageRides(): SRide[] {
        const sRides = this.storage.getValue<SRide[]>("rides");
        return sRides ?? [];
    }

    /**
     * Creates a storageRide entry in the rides array on storage
     *
     * @private
     * @param {string} playerHash - the hash of the player to connect the ride to
     * @param {number} rideId - the id of the ride
     * @return {SRide}
     */
    private createRideStorage(playerHash: string, rideId: number): SRide {
        const sRides = this.getAllStorageRides();

        const newSRide = {
            id: rideId,
            playerHash,
            previousTotalProfit: 0
        };

        sRides.push(newSRide);
        this.storage.setValue("rides", sRides);

        return newSRide;
    }

    /**
     * Deletes a rideStorage entry from storage
     *
     * @private
     * @param {number} id - the id of the ride
     * @return {void}
     */
    private deleteStorageRide(id: number): void {
        const sRides = this.getAllStorageRides();

        const filteredSRides = sRides.filter((ride) => ride.id !== id);

        this.storage.setValue("rides", filteredSRides);
    }

    /**
     * Handles the creation of a ride and all following actions
     *
     * @private
     * @param {number} playerId - the id of the player that has built the ride
     * @param {number} rideId - the id of the ride
     * @return {void}
     */
    private createRide(playerId: number, rideId: number): void {
        const {rides, hash, name} = this.playerManager.getPlayer(playerId) ?? {};

        if (!rides || !hash || !name) {
            return;
        }

        if (!rides.some((id) => id === rideId)) {
            rides.push(rideId);

            this.playerManager.updateStoragePlayer(playerId, "rides", rides);
        }

        this.createRideStorage(hash, rideId);
        this.setRideName(playerId, name, rideId);
    }

    /**
     * Handles the naming of a ride
     *
     * @private
     * @param {number} playerId - the id of the player that has built the ride
     * @param {string} playerName - the name of the player
     * @param {number} rideId - the id of the ride
     * @return {void}
     */
    private setRideName(playerId: number, playerName: string, rideId: number): void {
        const setName = (name: string, num: number): void => {
            context.executeAction('ridesetname', {
                ride: rideId,
                name: `${name} ${num}`
            }, (result) => {
                if (result.error === 1 && num < 50) {
                    setName(name, num + 1);
                }
            });
        };

        if (playerId >= 0 && playerId < network.numPlayers) {
            const ride = this.getRide(rideId as number);
            setName(`${playerName} ${ride?.name.replace(/[0-9]/g, '').trim()}`, 1);
        }
    }

    /**
     * Handles the demolishing of a ride and all following actions
     *
     * @private
     * @param {number} id - the id of the ride
     * @return {void}
     */
    private demolishRide(id: number): void {
        const {playerHash} = this.getStorageRide(id) ?? {};

        if (!playerHash) {
            return;
        }

        const {rides, id: playerId} = this.playerManager.getPlayer(playerHash) ?? {};

        if (!rides || !playerId) {
            return;
        }

        const filteredRides = rides.filter((ride) => ride !== id);

        // this.players.spendMoney(playerHash, -this.rideProperties[id].previousTotalProfit);

        this.playerManager.updateStoragePlayer(playerId, "rides", filteredRides);

        this.deleteStorageRide(id);
    }

    /**
     * Updates an entry in the storageRides in storage, through a key and value
     *
     * @public
     * @param {number} id - the id of the ride
     * @param {string} key - the key to store the value
     * @param {<T>>} value - the value to store
     * @return {SRide | null}
     */
    public updateStorageRide<T>(id: number, key: string, value: T): SRide | null {
        const sRide = this.getStorageRide(id);

        if (!sRide) {
            return null;
        }

        const updatedSRide = {
            ...sRide,
            [key]: value
        };

        const allSRides = this.getAllStorageRides();
        const filteredSRides = allSRides.filter((sRide) => sRide.id !== id);
        filteredSRides.push(updatedSRide);

        this.storage.setValue("rides", filteredSRides);

        return updatedSRide;
    }

    /**
     * Parses the mapRide and storageRide to output a pluginRide
     *
     * @static
     * @param {Ride} mRide - the data from the ride of the map
     * @param {SRide} sRide - the data from the ride in the storage
     * @return {IRide}
     */
    static parseRide(mRide: Ride, sRide: SRide): IRide {
        return {
            id: sRide.id,
            name: mRide.name,
            type: mRide.type,
            // classification: mapRide.classification,
            // status: mapRide.status,
            // mode: mapRide.mode,
            // colourSchemes: mapRide.colourSchemes,
            // stationStyle: mapRide.stationStyle,
            // music: mapRide.music,
            // stations: mapRide.stations,
            // price: mapRide.price,
            // excitement: mapRide.excitement,
            // intensity: mapRide.intensity,
            // nausea: mapRide.nausea,
            // totalCustomers: mapRide.totalCustomers,
            // runningCost: mapRide.runningCost,
            // value: mapRide.value,
            // object: mapRide.object,
            totalProfit: mRide.totalProfit,
            playerHash: sRide.playerHash,
            previousTotalProfit: sRide.previousTotalProfit ?? 0
        };
    }
}