import {BaseManager} from "@services//BaseManager";
import {PlayerManager} from "@services//PlayerManager";
import {ACTION_TYPE} from "@lib/enum";
import {find} from "@utils/array";

type MapRide = Ride;

type StorageRide = {
    id: number
    playerHash: string;
    previousTotalProfit: number
};

export type PluginRide = Omit<MapRide & StorageRide, "lifecycleFlags" | "departFlags" | "minimumWaitingTime" | "maximumWaitingTime" | "vehicles" | "vehicleColours" | "buildDate" | "age" | "inspectionInterval" | "downtime" | "liftHillSpeed" | "minLiftHillSpeed" | "maxLiftHillSpeed">;

type RideManagerOptions = {
    playerManager: PlayerManager
};


export class RideManager extends BaseManager {
    private playerManager: PlayerManager;

    constructor(options: RideManagerOptions) {
        super();
        this.playerManager = options.playerManager;
    }

    override init(): void {
        this.watchForActions();
    }

    watchForActions(): void {
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

    handleRideCreateAction({player, result}: GameActionEventArgs): void {
        if(!('ride' in result)) {
            return;
        }
        this.createRide(player, <number>result['ride']);
    }

    handleRideDemolishAction({args}: GameActionEventArgs): void {
        if(!('ride' in args)) {
            return;
        }
        this.demolishRide(<number>args['ride']);
    }

    getRide(id: number): PluginRide | null {
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

    getRideFromMap(id: number): MapRide {
        const ride = find(map.rides, ((nRide) => nRide.id === id));

        if (!ride) {
            throw new Error("Something went wrong!");
        }

        return ride;
    }

    getRideFromStorage(id: number): StorageRide | null {
        const rides = this.getRidesFromStorage();
        return find(rides, (ride) => ride.id === id);
    }


    getRidesFromStorage(): StorageRide[] {
        const rides = this.getValue<StorageRide[]>("rides");
        return rides ?? [];
    }

    createRideStorage(playerHash: string, rideId: number): StorageRide {
        const rides = this.getRidesFromStorage();

        const newRide = {
            id: rideId,
            playerHash,
            previousTotalProfit: 0
        };

        rides.push(newRide);
        this.setValue("rides", rides);

        return newRide;
    }

    deleteRideStorage(id: number): void {
        const rides = this.getRidesFromStorage();

        const filteredRides = rides.filter((ride) => ride.id !== id);

        this.setValue("rides", filteredRides);
    }

    createRide(playerId: number, rideId: number): void {
        const player = this.playerManager.getPlayer(playerId);

        if(!player) {
            return;
        }

        if (!player.rides.some((id) => id === rideId)) {
            const rides = player.rides;
            rides.push(rideId);

            this.playerManager.updateStoragePlayer(playerId, "rides", rides);
        }

        this.createRideStorage(player.hash, rideId);
        this.setRideName(playerId, player.name, rideId);
    }

    setRideName(playerId: number, playerName: string, rideId: number): void {
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


    demolishRide(id: number): void {
        const storageRide = this.getRideFromStorage(id);

        if (!storageRide) {
            return;
        }

        const player = this.playerManager.getPlayer(storageRide.playerHash);

        if(!player) {
            return;
        }

        const rides = player.rides.filter((ride) => ride !== id);

        // this.players.spendMoney(playerHash, -this.rideProperties[id].previousTotalProfit);

        this.playerManager.updateStoragePlayer(player.id, "rides", rides);

        this.deleteRideStorage(id);
    }

    updateStorageRide<T>(id: number, key: string, value: T): StorageRide | null {
        const storageRide = this.getRideFromStorage(id);

        if (!storageRide) {
            return null;
        }

        const updatedStorageRide = {
            ...storageRide,
            [key]: value
        };

        const allStorageRides = this.getRidesFromStorage();
        const filteredStorageRides = allStorageRides.filter((sRide) => sRide.id !== id);
        filteredStorageRides.push(updatedStorageRide);

        this.setValue("rides", filteredStorageRides);

        return updatedStorageRide;
    }

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