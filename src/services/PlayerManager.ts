import {BaseManager} from "@services/BaseManager";

type NetworkPlayer = Omit<Player, "ipAddress" | "ping" | "moneySpent">;

type StoragePlayer = {
    hash: string;
    rides: number[];
    moneySpent: number,
};

type PluginPlayer = Omit<NetworkPlayer, "publicKeyHash"> & StoragePlayer;

export class PlayerManager extends BaseManager {
    constructor() {
        super();
    }

    override init(): void {
        this.watchForNetworkJoin();
    }

    watchForNetworkJoin(): void {
        context.subscribe('network.join', ({player}) => {
            const networkPlayer = this.getPlayerFromNetwork(player);

            const storagePlayer = this.getPlayerFromStorage(networkPlayer.publicKeyHash);

            if(!storagePlayer) {
                this.handleNewPlayer(networkPlayer);
                return;
            }

            this.handleReturningPlayer(networkPlayer);
        });
    }

    handleNewPlayer(networkPlayer: NetworkPlayer): void {
        this.createStoragePlayer(networkPlayer);
        this.broadcastOnJoin(`{NEWLINE}{YELLOW}This server uses the Competitive Plugin.`, networkPlayer.id);
    }

    handleReturningPlayer(networkPlayer: NetworkPlayer): void {
        this.broadcastOnJoin(`{YELLOW}Welcome back, {WHITE}${networkPlayer.name}{WHITE}!`, networkPlayer.id);
    }

    getPlayer(idOrHash: number | string): PluginPlayer | null {
        if (idOrHash === -1) {
            return null;
        }

        const networkPlayer = this.getPlayerFromNetwork(idOrHash);
        const storagePlayer = this.getPlayerFromStorage(networkPlayer.publicKeyHash);

        if(!storagePlayer) {
            return null;
        }

        return PlayerManager.parsePlayer(networkPlayer, storagePlayer);
    }

    getPlayerByRide(id: number): PluginPlayer | null {
        const allStoragePlayers = this.getPlayersFromStorage();

        const foundStoragePlayer = allStoragePlayers.filter((sPlayer) => sPlayer.rides.some((ride) => ride == id))[0];

        if(!foundStoragePlayer) {
            return null;
        }

        return this.getPlayer(foundStoragePlayer.hash);
    }

    getPlayerFromNetwork(idOrHash: number | string): NetworkPlayer {
        let networkPlayer;

        if(typeof idOrHash === "number") {
            networkPlayer = network.players.filter((player) => player.id === idOrHash)[0];
        } else {
            networkPlayer = network.players.filter((player) => player.publicKeyHash === idOrHash)[0];
        }

        if(!networkPlayer) {
            throw new Error("No network player found!");
        }

        return networkPlayer;

    }

    getPlayerFromStorage(hash: string): StoragePlayer | undefined {
        const players = this.getPlayersFromStorage();
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
        };

        players.push(storagePlayer);
        this.setValue("players", players);

        return storagePlayer;
    }

    updateStoragePlayer<T>(idOrHash: number | string, key: string, value: T): StoragePlayer | null   {
        const player = this.getPlayerFromNetwork(idOrHash);
        const storagePlayer = this.getPlayerFromStorage(player.publicKeyHash);

        if(!storagePlayer) {
            return null;
        }

        const updatedStoragePlayer = {
            ...storagePlayer,
            [key]: value
        };

        const allStoragePlayers = this.getPlayersFromStorage();
        const filteredStoragePlayers = allStoragePlayers.filter((sPlayer) => sPlayer.hash !== storagePlayer.hash);
        filteredStoragePlayers.push(updatedStoragePlayer);

        this.setValue("players", filteredStoragePlayers);

        return updatedStoragePlayer;
    }

    static parsePlayer(networkPlayer: NetworkPlayer, storagePlayer: StoragePlayer): PluginPlayer {
        return {
            id: networkPlayer.id,
            name: networkPlayer.name,
            group: networkPlayer.group,
            commandsRan: networkPlayer.commandsRan,
            moneySpent: storagePlayer.moneySpent ?? 0,
            hash: storagePlayer.hash,
            rides: storagePlayer.rides
        };
    }

    static isServerPlayer(num: number): boolean {
        return num === 1;
    }

    static isAdmin(player: PluginPlayer): boolean {
        const {permissions}: PlayerGroup = network.getGroup(player.group);
        return permissions.indexOf("kick_player") >= 0;
    }

}