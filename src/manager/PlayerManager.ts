import {find} from "@utils/array";
import {Storage} from "@services/Storage";
import {Messenger} from "@services/Messenger";
import {Logger} from "@services/Logger";

let instantiated = false;

type PlayerManagerOptions = {
    messenger: Messenger
    logger: Logger
};

type NetworkPlayer = Omit<Player, "ipAddress" | "ping" | "moneySpent">;

type StoragePlayer = {
    hash: string;
    rides: number[];
    moneySpent: number,
};

type PluginPlayer = Omit<NetworkPlayer, "publicKeyHash"> & StoragePlayer;

/**
 * Class representing a manager for all player functionalities.
 * @class
 */
export class PlayerManager {
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
     * storage used throughout the manager
     * @private
     * @type {Storage}
     */
    private storage: Storage;

    /**
     * Construct a new PlayerManager and checks if none has been instantiated yet, then runs the init function
     *
     * @public
     * @param {PlayerManagerOptions} options - the options provided when instantiating
     * @return {PlayerManager}
     */
    constructor(options: PlayerManagerOptions) {
        if(instantiated) {
            throw new Error("UtilityManager can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;

        this.messenger = options.messenger;
        this.logger = options.logger;
        this.storage = new Storage({
            name: "PlayerManager"
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
        this.watchForNetworkJoin();
    }

    /**
     * Watches for network joins by players
     *
     * @private
     * @return {void}
     */
    private watchForNetworkJoin(): void {
        context.subscribe('network.join', ({player}) => {
            const networkPlayer = this.getPlayerFromNetwork(player);

            if (!networkPlayer) {
                return;
            }

            const storagePlayer = this.getPlayerFromStorage(networkPlayer.publicKeyHash);

            if (!storagePlayer) {
                this.handleNewPlayer(networkPlayer);
                return;
            }

            this.handleReturningPlayer(networkPlayer);
        });
    }

    /**
     * Handles new players and executes following actions
     *
     * @private
     * @param {NetworkPlayer} networkPlayer - the player on the network
     * @return {void}
     */
    private handleNewPlayer(networkPlayer: NetworkPlayer): void {
        this.createStoragePlayer(networkPlayer);
        this.messenger.messageOnConnect(`{NEWLINE}{YELLOW}This server uses the Competitive Plugin.`, networkPlayer.id);
    }

    /**
     * Handles returning players and executes following actions
     *
     * @private
     * @param {NetworkPlayer} networkPlayer - the player on the network
     * @return {void}
     */
    private handleReturningPlayer(networkPlayer: NetworkPlayer): void {
        this.messenger.messageOnConnect(`{YELLOW}Welcome back, {WHITE}${networkPlayer.name}{WHITE}!`, networkPlayer.id);
    }

    /**
     * Gets the player from both the network and storage through an id or hash
     *
     * @public
     * @param {number | string} idOrHash - the id or hash to find the player
     * @return {PluginPlayer | null}
     */
    public getPlayer(idOrHash: number | string): PluginPlayer | null {
        if (idOrHash === -1) {
            return null;
        }

        const networkPlayer = this.getPlayerFromNetwork(idOrHash);

        if (!networkPlayer) {
            this.logger.error("No network player found!");
            return null;
        }

        const storagePlayer = this.getPlayerFromStorage(networkPlayer.publicKeyHash);

        if (!storagePlayer) {
            this.logger.error("No storage player found!");
            return null;
        }

        return PlayerManager.parsePlayer(networkPlayer, storagePlayer);
    }

    /**
     * Gets the player through the use of a ride id
     *
     * @public
     * @param {number} id - the id of the ride to search the player upon
     * @return {PluginPlayer | null}
     */
    public getPlayerByRide(id: number): PluginPlayer | null {
        const allStoragePlayers = this.getPlayersFromStorage();

        const {hash} = find(allStoragePlayers, (sPlayer) => sPlayer.rides.some((ride) => ride == id)) ?? {};

        if (!hash) {
            return null;
        }

        return this.getPlayer(hash);
    }

    /**
     * Gets the player from the network through an id or hash
     *
     * @private
     * @param {number | string} idOrHash - the id or hash to find the player
     * @return {NetworkPlayer | null}
     */
    private getPlayerFromNetwork(idOrHash: number | string): NetworkPlayer | null {
        let networkPlayer;

        if (typeof idOrHash === "number") {
            networkPlayer = find(network.players, ((player) => player.id === idOrHash));
        } else {
            networkPlayer = find(network.players, ((player) => player.publicKeyHash === idOrHash));
        }

        if (!networkPlayer) {
            this.logger.error("No network player found!");
            return null;
        }

        return networkPlayer;

    }

    /**
     * Gets a player from the storage through a hash
     *
     * @private
     * @param {string} hash - the hash to find the player
     * @return {StoragePlayer | null}
     */
    private getPlayerFromStorage(hash: string): StoragePlayer | null {
        const storagePlayers = this.getPlayersFromStorage();
        return find(storagePlayers, ((player) => player.hash === hash));
    }

    /**
     * Gets all player from the storage
     *
     * @private
     * @return {StoragePlayer[]}
     */
    private getPlayersFromStorage(): StoragePlayer[] {
        const storagePlayers = this.storage.getValue<StoragePlayer[]>("players");
        return storagePlayers ?? [];
    }

    /**
     * Creates an new storage player and saves it in the storage based on a network player
     *
     * @private
     * @param {NetworkPlayer} networkPlayer - the networkPlayer to make a storagePlayer from
     * @return {StoragePlayer}
     */
    private createStoragePlayer(networkPlayer: NetworkPlayer): StoragePlayer {
        const storagePlayers = this.getPlayersFromStorage();

        const storagePlayer = {
            hash: networkPlayer.publicKeyHash,
            rides: [],
            moneySpent: 0
        };

        storagePlayers.push(storagePlayer);
        this.storage.setValue("players", storagePlayers);

        return storagePlayer;
    }

    /**
     * Updates an entry in the storagePlayers in storage, through a key and value
     *
     * @public
     * @param {number | string} idOrHash - the id or hash of the player
     * @param {string} key - the key to store the value
     * @param {<T>>} value - the value to store
     * @return {StoragePlayer | null}
     */
    public updateStoragePlayer<T>(idOrHash: number | string, key: string, value: T): StoragePlayer | null {
        const {publicKeyHash} = this.getPlayerFromNetwork(idOrHash) ?? {};

        if (!publicKeyHash) {
            return null;
        }

        const storagePlayer = this.getPlayerFromStorage(publicKeyHash);

        if (!storagePlayer) {
            return null;
        }

        const updatedStoragePlayer = {
            ...storagePlayer,
            [key]: value
        };

        const allStoragePlayers = this.getPlayersFromStorage();
        const filteredStoragePlayers = allStoragePlayers.filter((sPlayer) => sPlayer.hash !== storagePlayer.hash);
        filteredStoragePlayers.push(updatedStoragePlayer);

        this.storage.setValue("players", filteredStoragePlayers);

        return updatedStoragePlayer;
    }

    /**
     * Parses the storagePlayer and storagePlayer to output a pluginRide
     *
     * @static
     * @param {NetworkPlayer} networkPlayer - the data from the player of the network
     * @param {StoragePlayer} storagePlayer - the data from the player in the storage
     * @return {PluginPlayer}
     */
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

    /**
     * Validates if the player is the actual server
     *
     * @static
     * @param {number} num - the number to validate
     * @return {boolean}
     */
    static isServerPlayer(num: number): boolean {
        return num === 1;
    }

    /**
     * Validates if the player is an admin
     *
     * @static
     * @param {PluginPlayer} player - the player to validate
     * @return {boolean}
     */
    static isAdmin(player: PluginPlayer): boolean {
        const {permissions}: PlayerGroup = network.getGroup(player.group);
        return permissions.indexOf("kick_player") >= 0;
    }

}