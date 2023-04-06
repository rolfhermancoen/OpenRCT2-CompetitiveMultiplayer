import {BaseManager} from "./BaseManager";

type NetworkPlayer = Omit<Player, "ipAddress" | "ping" | "moneySpent">;

type StoragePlayer = {
    hash: string;
    rides: number[];
    moneySpent: number,
}

export class PlayerManager extends BaseManager {
    constructor() {
        super();
    }

    override init() {
        this.subscribeNetworkJoin()
    }

    subscribeNetworkJoin() {
        context.subscribe('network.join', ({player}) => {
            const networkPlayer = this.getPlayerFromNetwork(player);

            const storagePlayer = this.getPlayerFromStorage(networkPlayer.publicKeyHash)

            if(!storagePlayer) {
                this.createStoragePlayer(networkPlayer)
                this.broadcastOnJoin(`{NEWLINE}{YELLOW}This server uses the Competitive Plugin.`, [player]);
                return;
            }

            this.broadcastOnJoin(`{YELLOW}Welcome back, {WHITE}${networkPlayer.name}{WHITE}!`, [player])
        })
    }

    getPlayer(idOrHash: number | string): Omit<NetworkPlayer, "publicKeyHash"> & StoragePlayer {
        if (idOrHash === -1) {
            throw new Error("getPlayer with -1!");
        }

        const networkPlayer = this.getPlayerFromNetwork(idOrHash);
        const storagePlayer = this.getPlayerFromStorage(networkPlayer.publicKeyHash);

        if(!storagePlayer) {
            throw new Error("No storage player found!");
        }

        return {
            id: networkPlayer.id,
            name: networkPlayer.name,
            group: networkPlayer.group,
            commandsRan: networkPlayer.commandsRan,
            moneySpent: storagePlayer.moneySpent ?? 0,
            hash: storagePlayer.hash,
            rides: storagePlayer.rides
        }
    }

    getPlayerFromNetwork(idOrHash: number | string): NetworkPlayer {
        let networkPlayer;

        if(typeof idOrHash === "number") {
            networkPlayer = network.players.filter((player) => player.id === idOrHash)[0]
        } else {
            networkPlayer = network.players.filter((player) => player.publicKeyHash === idOrHash)[0]
        }

        if(!networkPlayer) {
            throw new Error("No network player found!");
        }

        return networkPlayer

    }

    getPlayerFromStorage(hash: string): StoragePlayer | undefined {
        const players = this.getPlayersFromStorage()
        return players?.filter((player) => player.hash === hash)[0];
    }

    getPlayersFromStorage(): StoragePlayer[] {
        const players = this.getValue<StoragePlayer[]>("players");
        return players ?? [];
    }

    createStoragePlayer(networkPlayer: NetworkPlayer): StoragePlayer {
        const players = this.getPlayersFromStorage();

        const storagePlayer = {
            hash: networkPlayer.publicKeyHash,
            rides: [],
            moneySpent: 0
        }

        players.push(storagePlayer);
        this.setValue("players", players);

        return storagePlayer;
    }

    updateStoragePlayer<T>(idOrHash: number | string, key: string, value: T) {
        const player = this.getPlayer(idOrHash);
        const storagePlayer = this.getPlayerFromStorage(player.hash);

        console.log('storagePlayer', storagePlayer);

        if(!storagePlayer) {
            return;
        }

        const updatedStoragePlayer = {
            ...storagePlayer,
            [key]: value
        }

        const allStoragePlayers = this.getPlayersFromStorage();
        const filteredStoragePlayers = allStoragePlayers.filter((sPlayer) => sPlayer.hash !== storagePlayer.hash);
        filteredStoragePlayers.push(updatedStoragePlayer);

        this.setValue("players", filteredStoragePlayers);

        console.log('updatedStoragePlayer', updatedStoragePlayer)

        return updatedStoragePlayer;
    }

}