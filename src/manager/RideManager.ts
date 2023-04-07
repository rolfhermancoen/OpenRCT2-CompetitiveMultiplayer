import {PlayerManager} from "@src/manager/PlayerManager";
import {ACTION_TYPE} from "@lib/enum";
import {find} from "@utils/array";
import {Storage} from "@services/Storage";
import {Logger} from "@services/Logger";

let instantiated = false;

type MapRide = Ride;

type StorageRide = {
    id: number
    playerHash: string;
    previousTotalProfit: number
};

export type PluginRide = Omit<MapRide & StorageRide, "lifecycleFlags" | "departFlags" | "minimumWaitingTime" | "maximumWaitingTime" | "vehicles" | "vehicleColours" | "buildDate" | "age" | "inspectionInterval" | "downtime" | "liftHillSpeed" | "minLiftHillSpeed" | "maxLiftHillSpeed">;

type RideManagerOptions = {
    playerManager: PlayerManager
    logger: Logger;
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
     * @param {UtilityManagerOptions} options - the options provided when instantiating
     * @return {UtilityManager}
     */
    constructor(options: RideManagerOptions) {
        if(instantiated) {
            throw new Error("UtilityManager can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;

        this.playerManager = options.playerManager;
        this.logger = options.logger;
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
        context.subscribe('action.execute', (event) => {
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
     * @return {PluginRide | null}
     */
    public getRide(id: number): PluginRide | null {
        if (id === -1) {
            return null;
        }

        const mapRide = this.getRideFromMap(id);
        const storageRide = this.getRideFromStorage(id);

        if (!mapRide || !storageRide) {
            return null;
        }


        return RideManager.parseRide(mapRide, storageRide);
    }

    /**
     * Gets the ride from the map
     *
     * @private
     * @param {number} id - the id to find the ride
     * @return {MapRide | null}
     */
    private getRideFromMap(id: number): MapRide | null {
        const ride = find(map.rides, ((nRide) => nRide.id === id));

        if (!ride) {
            this.logger.error("Something went wrong!");
            return null;
        }

        return ride;
    }

    /**
     * Gets the ride from the storage
     *
     * @private
     * @param {number} id - the id to find the ride
     * @return {StorageRide | null}
     */
    private getRideFromStorage(id: number): StorageRide | null {
        const storageRides = this.getAllRidesFromStorage();
        return find(storageRides, (ride) => ride.id === id);
    }

    /**
     * Gets all the rides from storage
     *
     * @private
     * @return {StorageRide[] | null}
     */
    private getAllRidesFromStorage(): StorageRide[] {
        const storageRides = this.storage.getValue<StorageRide[]>("rides");
        return storageRides ?? [];
    }

    /**
     * Creates a storageRide entry in the rides array on storage
     *
     * @private
     * @param {string} playerHash - the hash of the player to connect the ride to
     * @param {number} rideId - the id of the ride
     * @return {StorageRide}
     */
    private createRideStorage(playerHash: string, rideId: number): StorageRide {
        const storageRides = this.getAllRidesFromStorage();

        const newStorageRide = {
            id: rideId,
            playerHash,
            previousTotalProfit: 0
        };

        storageRides.push(newStorageRide);
        this.storage.setValue("rides", storageRides);

        return newStorageRide;
    }

    /**
     * Deletes a rideStorage entry from storage
     *
     * @private
     * @param {number} id - the id of the ride
     * @return {void}
     */
    private deleteRideStorage(id: number): void {
        const storageRides = this.getAllRidesFromStorage();

        const filteredStorageRides = storageRides.filter((ride) => ride.id !== id);

        this.storage.setValue("rides", filteredStorageRides);
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
        const {playerHash} = this.getRideFromStorage(id) ?? {};

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

        this.deleteRideStorage(id);
    }

    /**
     * Updates an entry in the storageRides in storage, through a key and value
     *
     * @public
     * @param {number} id - the id of the ride
     * @param {string} key - the key to store the value
     * @param {<T>>} value - the value to store
     * @return {StorageRide | null}
     */
    public updateStorageRide<T>(id: number, key: string, value: T): StorageRide | null {
        const storageRide = this.getRideFromStorage(id);

        if (!storageRide) {
            return null;
        }

        const updatedStorageRide = {
            ...storageRide,
            [key]: value
        };

        const allStorageRides = this.getAllRidesFromStorage();
        const filteredStorageRides = allStorageRides.filter((sRide) => sRide.id !== id);
        filteredStorageRides.push(updatedStorageRide);

        this.storage.setValue("rides", filteredStorageRides);

        return updatedStorageRide;
    }

    /**
     * Parses the mapRide and storageRide to output a pluginRide
     *
     * @static
     * @param {MapRide} mapRide - the data from the ride of the map
     * @param {StorageRide} storageRide - the data from the ride in the storage
     * @return {PluginRide}
     */
    static parseRide(mapRide: MapRide, storageRide: StorageRide): PluginRide {
        return {
            id: mapRide.id,
            name: mapRide.name,
            type: mapRide.type,
            classification: mapRide.classification,
            status: mapRide.status,
            mode: mapRide.mode,
            colourSchemes: mapRide.colourSchemes,
            stationStyle: mapRide.stationStyle,
            music: mapRide.music,
            stations: mapRide.stations,
            price: mapRide.price,
            excitement: mapRide.excitement,
            intensity: mapRide.intensity,
            nausea: mapRide.nausea,
            totalCustomers: mapRide.totalCustomers,
            runningCost: mapRide.runningCost,
            value: mapRide.value,
            object: mapRide.object,
            totalProfit: mapRide.totalProfit,
            playerHash: storageRide.playerHash,
            previousTotalProfit: storageRide.previousTotalProfit ?? 0
        };
    }
}