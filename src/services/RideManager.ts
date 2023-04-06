import {BaseManager} from "./BaseManager";
import {PlayerManager} from "./PlayerManager";

type NetworkRide = Ride;

type StorageRide = {
    id: number
    playerHash: string;
    previousTotalProfit: number
}

interface RideManagerOptions {
    playerManager: PlayerManager
}


export class RideManager extends BaseManager {
    private playerManager: PlayerManager;

    constructor(options: RideManagerOptions) {
        super();
        this.playerManager = options.playerManager;
    }

    override init() {
        this.subscribeActionExecute();
    }

    subscribeActionExecute() {
        context.subscribe('action.execute', ({player, action, result, args}) => {
            if (player === -1) {
                return;
            }

            if (action === 'ridecreate' &&
                'ride' in result) {
                this.createRide(player, <number>result['ride']);
            }

            if (action === 'ridedemolish' &&
                'ride' in args) {
                this.demolishRide(<number>args['ride']);
            }


        });
    }

    getRide(id: number): Omit<NetworkRide & StorageRide, "lifecycleFlags" | "departFlags" | "minimumWaitingTime" | "maximumWaitingTime" | "vehicles" | "vehicleColours" | "buildDate" | "age" | "inspectionInterval" | "downtime" | "liftHillSpeed" | "minLiftHillSpeed" | "maxLiftHillSpeed"> | null {
        if (id === -1) {
            return null;
        }

        const networkRide = this.getRideFromNetwork(id);
        const storageRide = this.getRideFromStorage(id);

        if (!networkRide || !storageRide) {
            return null;
        }


        return {
            id: networkRide.id,
            name: networkRide.name,
            type: networkRide.type,
            classification: networkRide.classification,
            status: networkRide.status,
            mode: networkRide.mode,
            colourSchemes: networkRide.colourSchemes,
            stationStyle: networkRide.stationStyle,
            music: networkRide.music,
            stations: networkRide.stations,
            price: networkRide.price,
            excitement: networkRide.excitement,
            intensity: networkRide.intensity,
            nausea: networkRide.nausea,
            totalCustomers: networkRide.totalCustomers,
            runningCost: networkRide.runningCost,
            value: networkRide.value,
            object: networkRide.object,
            totalProfit: networkRide.totalProfit,
            playerHash: storageRide.playerHash,
            previousTotalProfit: storageRide.previousTotalProfit ?? 0
        };
    }

    getRideFromNetwork(id: number): NetworkRide {
        const networkRide: NetworkRide = map.rides.filter((nRide) => nRide.id === id)[0];

        if (!networkRide) {
            throw new Error("Something went wrong!");
        }

        return networkRide;
    }

    getRideFromStorage(id: number): StorageRide | undefined {
        const rides = this.getRidesFromStorage()
        return rides?.filter((ride) => ride.id === id)[0];
    }


    getRidesFromStorage(): StorageRide[] {
        const rides = this.getValue<StorageRide[]>("rides")
        return rides ?? [];
    }

    createRideStorage(playerHash: string, rideId: number): StorageRide {
        const rides = this.getRidesFromStorage();

        const newRide = {
            id: rideId,
            playerHash,
            previousTotalProfit: 0
        }

        rides.push(newRide);
        this.setValue("rides", rides);

        return newRide
    }

    deleteRideStorage(id: number) {
        const rides = this.getRidesFromStorage();

        const filteredRides = rides.filter((ride) => ride.id !== id);

        this.setValue("rides", filteredRides);
    }

    createRide(playerId: number, rideId: number) {
        const player = this.playerManager.getPlayer(playerId);

        if (!player.rides.some((id) => id === rideId)) {
            const rides = player.rides;
            rides.push(rideId);

            this.playerManager.updateStoragePlayer(playerId, "rides", rides);
        }

        this.createRideStorage(player.hash, rideId);
        this.setRideName(playerId, player.name, rideId);
    }

    setRideName(playerId: number, playerName: string, rideId: number) {
        const setName = (name: string, num: number) => {
            context.executeAction('ridesetname', {
                ride: rideId,
                name: `${name} ${num}`
            }, (result) => {
                if (result.error === 1 && num < 50) {
                    setName(name, num + 1);
                }
            })
        }

        if (playerId >= 0 && playerId < network.numPlayers) {
            const ride = this.getRide(rideId as number)
            setName(`${playerName} ${ride?.name.replace(/[0-9]/g, '').trim()}`, 1);
        }
    }


    demolishRide(id: number) {
        const storageRide = this.getRideFromStorage(id);

        if (!storageRide) {
            return;
        }

        const player = this.playerManager.getPlayer(storageRide.playerHash);
        const rides = player.rides.filter((ride) => ride !== id);

        // this.players.spendMoney(playerHash, -this.rideProperties[id].previousTotalProfit);

        this.playerManager.updateStoragePlayer(player.id, "rides", rides);

        this.deleteRideStorage(id);
    }

    updateStorageRide<T>(id: number, key: string, value: T) {
        const storageRide = this.getRideFromStorage(id);

        if (!storageRide) {
            return;
        }

        const updatedStorageRide = {
            ...storageRide,
            [key]: value
        }

        const allStorageRides = this.getRidesFromStorage();
        const filteredStoragedRides = allStorageRides.filter((sRide) => sRide.id !== id);
        filteredStoragedRides.push(updatedStorageRide);

        this.setValue("rides", filteredStoragedRides);

        return updatedStorageRide

    }
}