import {find} from "@utils/array";

import {CollectionValue, Storage} from "@services/Storage";
import {Messenger} from "@services/Messenger";
import {Logger} from "@services/Logger";

let instantiated = false;

type PlayerManagerOptions = {
    messenger: Messenger
};

// type NetworkPlayer = Omit<Player, "ipAddress" | "ping" | "moneySpent">;

type SPLayer = {
    rides: number[];
    moneySpent: number,
};

type IPlayer = SPLayer & Pick<Player, "id" | "name" | "group"> & { hash: string };

type PlayerStorage = {
    players: SPLayer[]
};

/**
 * Class representing a manager for all player functionalities.
 */
export class PlayerManager {
    /**
     * messenger used throughout the manager
     * @private
     */
    private messenger: Messenger;
    /**
     * logger used through the manager
     * @private
     */
    private logger: Logger;
    /**
     * storage used throughout the manager
     * @private
     */
    private storage: Storage<PlayerStorage>;

    /**
     * Construct a new PlayerManager and checks if none has been instantiated yet, then runs the init function
     *
     * @param {PlayerManagerOptions} options - the options provided when instantiating
     * @return {PlayerManager}
     */
    constructor(options: PlayerManagerOptions) {
        if (instantiated) {
            throw new Error("UtilityManager can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;

        this.messenger = options.messenger;

        this.logger = new Logger({
            name: "PlayerManager"
        });
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
            const networkPlayer = this.getNetworkPlayer(player);

            if (!networkPlayer) {
                return;
            }

            const storagePlayer = this.getStoragePlayer(networkPlayer.publicKeyHash);

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
     * @param {Player} nPlayer - the player on the network
     * @return {void}
     */
    private handleNewPlayer(nPlayer: Player): void {
        this.createStoragePlayer(nPlayer);
        this.messenger.messageOnConnect(`{NEWLINE}{YELLOW}This server uses the Competitive Plugin.`, nPlayer.id);
    }

    /**
     * Handles returning players and executes following actions
     *
     * @private
     * @param {Player} nPlayer - the player on the network
     * @return {void}
     */
    private handleReturningPlayer(nPlayer: Player): void {
        this.messenger.messageOnConnect(`{YELLOW}Welcome back, {WHITE}${nPlayer.name}{WHITE}!`, nPlayer.id);
    }

    /**
     * Gets the player from both the network and storage through an id or hash
     *
     * @public
     * @param {number | string} idOrHash - the id or hash to find the player
     * @return {IPlayer | null}
     */
    public getPlayer(idOrHash: number | string): IPlayer | null {
        if (idOrHash === -1 || idOrHash === 0) {
            return null;
        }

        const nPlayer = this.getNetworkPlayer(idOrHash);

        if (!nPlayer) {
            this.logger.error(`No network player found with id or hash: ${idOrHash}!`);
            return null;
        }

        const sPlayer = this.getStoragePlayer(nPlayer.publicKeyHash);

        if (!sPlayer) {
            this.logger.error(`No storage player found with id or hash: ${idOrHash}!`);
            return null;
        }

        return PlayerManager.parsePlayer(nPlayer, sPlayer);
    }

    // /**
    //  * Gets the player through the use of a ride id
    //  *
    //  * @public
    //  * @param {number} id - the id of the ride to search the player upon
    //  * @return {IPlayer | null}
    //  */
    // public getPlayerByRide(id: number): IPlayer | null {
    //     const allSPlayers = this.getAllStoragePlayers();
    //
    //     const {hash} = find(allSPlayers, (sPlayer) => sPlayer.rides.some((ride) => ride == id)) ?? {};
    //
    //     if (!hash) {
    //         return null;
    //     }
    //
    //     return this.getPlayer(hash);
    // }

    /**
     * Gets the player from the network through an id or hash
     *
     * @private
     * @param {number | string} idOrHash - the id or hash to find the player
     * @return {Player | null}
     */
    private getNetworkPlayer(idOrHash: number | string): Player | null {
        let nPlayer;

        if (typeof idOrHash === "number") {
            nPlayer = find(network.players, ((player) => player.id === idOrHash));
        } else {
            nPlayer = find(network.players, ((player) => player.publicKeyHash === idOrHash));
        }

        if (!nPlayer) {
            this.logger.error(`No network player found with the following has or id: ${idOrHash}!`);
            return null;
        }

        return nPlayer;

    }

    /**
     * Gets a player from the storage through a hash
     *
     * @private
     * @param {string} hash - the hash to find the player
     * @return {SPLayer | null}
     */
    private getStoragePlayer(hash: string): CollectionValue<SPLayer> | null {
        const player = this.storage.getValueFromCollection<SPLayer>("players", hash);

        if (!player) {
            this.logger.warning(`No player found in storage with hash: ${hash}`);
            return null;
        }

        this.logger.debug(`getStoragePlayer with hash: ${hash} returns player: ${player}`);
        return player;
    }

    /**
     * Creates an new storage player and saves it in the storage based on a network player
     *
     * @private
     * @param {Player} nPlayer - the networkPlayer to make a storagePlayer from
     * @return {SPLayer}
     */
    private createStoragePlayer(nPlayer: Player): SPLayer {
        const newStoragePlayer = {
            rides: [],
            moneySpent: 0
        };

        return this.storage.setCollectionValue("players", nPlayer.publicKeyHash, newStoragePlayer);
    }

    // /**
    //  * Updates an entry in the storagePlayers in storage, through a key and value
    //  *
    //  * @public
    //  * @param {number | string} idOrHash - the id or hash of the player
    //  * @param {string} key - the key to store the value
    //  * @param {<T>>} value - the value to store
    //  * @return {SPLayer | null}
    //  */
    // public updateStoragePlayer<T>(idOrHash: number | string, key: string, value: T): SPLayer | null {
    //     const {publicKeyHash} = this.getNetworkPlayer(idOrHash) ?? {};
    //
    //     if (!publicKeyHash) {
    //         return null;
    //     }
    //
    //     const sPlayer = this.getStoragePlayer(publicKeyHash);
    //
    //     if (!sPlayer) {
    //         return null;
    //     }
    //
    //     const updatedSPlayer = {
    //         ...sPlayer,
    //         [key]: value
    //     };
    //
    //     const allSPlayers = this.getAllStoragePlayers();
    //     const filteredSPlayers = allSPlayers.filter((sPlayer) => sPlayer.hash !== sPlayer.hash);
    //     filteredSPlayers.push(updatedSPlayer);
    //
    //     this.storage.setValue("players", filteredSPlayers);
    //
    //     return updatedSPlayer;
    // }

    /**
     * Parses the storagePlayer and storagePlayer to output a pluginRide
     *
     * @static
     * @param {Player} nPlayer - the data from the player of the network
     * @param {SPLayer} sPlayer - the data from the player in the storage
     * @return {IPlayer}
     */
    static parsePlayer(nPlayer: Player, sPlayer: CollectionValue<SPLayer>): IPlayer {
        return {
            id: nPlayer.id,
            name: nPlayer.name,
            group: nPlayer.group,
            moneySpent: nPlayer.moneySpent ?? 0,
            hash: sPlayer.key,
            rides: sPlayer.value.rides
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
        return num === 0;
    }

    /**
     * Validates if the player is an admin
     *
     * @static
     * @param {IPlayer} player - the player to validate
     * @return {boolean}
     */
    static isAdmin(player: IPlayer): boolean {
        const {permissions}: PlayerGroup = network.getGroup(player.group);
        return permissions.indexOf("kick_player") >= 0;
    }

}