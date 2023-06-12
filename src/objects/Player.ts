import {isNumber} from "@utils/type";
import {Logger} from "@services/Logger";
import {find} from "@utils/array";
import {combine} from "@utils/object";
import {Storage} from "@services/Storage";
import {messageOnConnect} from "@utils/message";
import {IRide} from "@src/objects/Ride";

const INITIAL_STORAGE_PLAYER = {
    rides: [],
    moneySpent: 0
};

type SPlayer = {
    lastSeen?: Date
    rides: number[];
    moneySpent: number,
};

export const getAllPlayers = (): IPlayer[] => network.players.map((p) => new IPlayer(p));

const logger = new Logger({
    name: "IPlayer"
});

const storage = new Storage({
    name: "IPlayer"
});

/**
 * Represents a player in the server.
 */
export class IPlayer {
    private readonly _id: number;
    private _networkPlayerObj?: Player | null;
    private _storagePlayerObj?: SPlayer | null;

    constructor(player: Player);
    constructor(id: number);
    constructor(param: Player | number) {
        if (isNumber(param)) {
            this._id = param;
            this._refresh();
        } else {
            this._id = param.id;
            this._networkPlayerObj = param;
            this._storagePlayerObj = this._getStoragePlayer(param.publicKeyHash);
        }
    }

    private _refresh(): boolean {
        logger.debug(`refresh: ${this._id}`);

        const nPlayer = this._getNetworkPlayer(this._id);
        if (nPlayer) {
            this._networkPlayerObj = nPlayer;
        } else {
            this._networkPlayerObj = null;
            return false;
        }

        const sPlayer = this._getStoragePlayer(nPlayer.publicKeyHash);
        if (sPlayer) {
            this._storagePlayerObj = sPlayer;
        } else {
            this._storagePlayerObj = this._createStoragePlayer(this._networkPlayerObj.publicKeyHash);
        }

        return true;
    }

    public get id(): number {
        return this._id;
    }

    public player(): Player & SPlayer | null {
        if (!this._networkPlayerObj || !this._storagePlayerObj) {
            return null;
        }
        return combine<Player & SPlayer>(this._networkPlayerObj, this._storagePlayerObj);
    }

    public networkPlayer(): Player {
        return <Player>this._networkPlayerObj;
    }

    /**
     * Gets the player from the network through an id or hash
     *
     * @param {number} id - the id or hash to find the player
     * @return {Player | null}
     */
    private _getNetworkPlayer(id: number): Player | null {
        const nPlayer = find(network.players, (player) => player.id === id);

        if (!nPlayer) {
            logger.error(`No network player found with the following id: ${id}!`);
            return null;
        }

        logger.debug(`_getNetworkPlayer with id: ${id} returns player: ${nPlayer}`);
        this._networkPlayerObj = nPlayer;
        return nPlayer;
    }

    public storagePlayer(): SPlayer {
        return <SPlayer>this._storagePlayerObj;
    }

    /**
     * Gets a player from the storage through a hash
     *
     * @param {string} hash - the hash to find the player
     * @return {SPlayer | null}
     */
    private _getStoragePlayer(hash: string): SPlayer | null {
        const sPlayer = storage.getValueFromCollection<SPlayer>("players", hash);

        if (!sPlayer?.value) {
            logger.warning(`No player found in storage with hash: ${hash}`);
            return null;
        }

        logger.debug(`_getStoragePlayer with hash: ${hash} returns player: ${sPlayer.value}`);
        this._storagePlayerObj = sPlayer.value;
        return sPlayer.value;
    }

    private _createStoragePlayer(hash: string): SPlayer {
        return storage.setCollectionValue("players", hash, INITIAL_STORAGE_PLAYER);
    }

    private _setLastSeen(): SPlayer | null {
        if (!this._storagePlayerObj || !this._networkPlayerObj?.publicKeyHash) {
            return null;
        }
        const date = new Date();

        const updatedStoragePlayer = combine<SPlayer>(this._storagePlayerObj, {lastSeen: date});
        this._storagePlayerObj = updatedStoragePlayer;
        return storage.setCollectionValue("players", this._networkPlayerObj.publicKeyHash, updatedStoragePlayer);
    }

    public welcome(): void {
        logger.debug(`IPlayer welcome(): ${this._storagePlayerObj?.lastSeen}`,);
        if (!this._storagePlayerObj?.lastSeen) {
            messageOnConnect(`{NEWLINE}{YELLOW}Welcome, {WHITE}${this._networkPlayerObj?.name}{YELLOW}!{NEWLINE}This server uses the Competitive Plugin.`, this._id);
            return;
        }
        messageOnConnect(`{NEWLINE}{YELLOW}Welcome back, {WHITE}${this._networkPlayerObj?.name}{YELLOW}!{NEWLINE}{YELLOW}Your last visit was: {WHITE}${this._storagePlayerObj?.lastSeen}{YELLOW}!`, this._id);
        return;
    }

    public leave(): void {
        this._setLastSeen();
    }

    public addRideToPlayer(ride: IRide): SPlayer | null {
        if (!this._storagePlayerObj || !this._networkPlayerObj?.publicKeyHash) {
            return null;
        }

        const rides = this._storagePlayerObj.rides.slice();
        rides.push(ride.mapRide().id);

        const updatedStoragePlayer = combine<SPlayer>(this._storagePlayerObj, {rides});
        this._storagePlayerObj = updatedStoragePlayer;
        return storage.setCollectionValue("players", this._networkPlayerObj.publicKeyHash, updatedStoragePlayer);
    }

    public deleteRideFromPlayer(ride: IRide): SPlayer | null {
        if (!this._storagePlayerObj || !this._networkPlayerObj?.publicKeyHash) {
            return null;
        }

        const rides = this._storagePlayerObj.rides.slice();
        rides.filter((rideId) => rideId !== ride.mapRide().id);

        const updatedStoragePlayer = combine<SPlayer>(this._storagePlayerObj, {rides});
        this._storagePlayerObj = updatedStoragePlayer;
        return storage.setCollectionValue("players", this._networkPlayerObj.publicKeyHash, updatedStoragePlayer);
    }

    /**
     * Validates if the player is the actual server
     *
     * @return {boolean}
     */
    public isServer(): boolean {
        return this._networkPlayerObj?.id === 0;
    }

    /**
     * Validates if the player is an admin
     *
     * @return {boolean}
     */
    public isAdmin(): boolean {
        if (!this._networkPlayerObj?.group) {
            return false;
        }
        const {permissions}: PlayerGroup = network.getGroup(this._networkPlayerObj?.group ?? 0);
        return permissions.indexOf("kick_player") >= 0;
    }

    public isRideOwner(ride: IRide): boolean {
        if (!this._storagePlayerObj) {
            return false;
        }
        return this._storagePlayerObj.rides.some((rideId) => rideId === ride.mapRide().id);
    }

}