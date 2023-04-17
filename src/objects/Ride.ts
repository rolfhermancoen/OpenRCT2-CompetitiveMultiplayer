import {isNumber} from "@utils/type";
import {Logger} from "@services/Logger";
import {find} from "@utils/array";
import {combine} from "@utils/object";
import {Storage} from "@services/Storage";
import {IPlayer} from "@src/objects/Player";

const INITIAL_STORAGE_RIDE = {
    previousTotalProfit: 0
};

type SRide = {
    owner?: string;
    previousTotalProfit: number
};

export const getAllRides = (): IRide[] => map
    .rides
    .map(r => new IRide(r));

const logger = new Logger({
    name: "IRide"
});

const storage = new Storage({
    name: "IRide"
});

/**
 * Represents a ride on the map
 */
export class IRide {
    private readonly _id: number;
    private _mapRideObj?: Ride | null;
    private _storageRideObj?: SRide | null;

    constructor(ride: Ride);
    constructor(id: number);
    constructor(param: Ride | number) {
        if (isNumber(param)) {
            this._id = param;
            if (param === -1) {
                return;
            }
            this._refresh();
        } else {
            this._id = param.id;
            this._mapRideObj = param;
        }
    }

    private _refresh(): boolean {
        logger.debug(`refresh: ${this._id}`);

        const mRide = this._getMapRide(this._id);
        if (mRide) {
            this._mapRideObj = mRide;
        } else {
            this._mapRideObj = null;
            return false;
        }

        const sRide = this._getStorageRide(this._id);
        if (sRide) {
            this._storageRideObj = sRide;
        } else {
            this._storageRideObj = this._createStorageRide(this._id);
        }


        return true;
    }

    public ride(): Ride & SRide | null {
        if (!this._mapRideObj || !this._storageRideObj) {
            return null;
        }
        return combine<Ride & SRide>(this._mapRideObj, this._storageRideObj);
    }

    public mapRide(): Ride {
        return <Ride>this._mapRideObj;
    }


    /**
     * Gets the ride from the map
     *
     * @param {number} id - the id to find the ride
     * @return {Ride | null}
     */
    private _getMapRide(id: number): Ride | null {
        const mRide = find(map.rides, (ride) => ride.id === this._id);

        if (!mRide) {
            logger.error(`No map ride found with the following id: ${id}!`);
            return null;
        }

        logger.debug(`_getMapRide with id: ${id} returns ride: ${mRide}`);
        return mRide;
    }

    public storageRide(): SRide {
        return <SRide>this._storageRideObj;
    }

    /**
     * Gets the ride from the storage
     *
     * @param {number} id - the id to find the ride
     * @return {SRide | null}
     */
    private _getStorageRide(id: number): SRide | null {
        const sRide = storage.getValueFromCollection<SRide>("rides", id.toString());

        if (!sRide?.value) {
            logger.warning(`No ride found in storage with id: ${id}`);
            return null;
        }

        logger.debug(`_getStorageRide with id: ${id} returns ride: ${sRide.value}`);
        return sRide.value;
    }

    private _createStorageRide(id: number): SRide {
        return storage.setCollectionValue("rides", id.toString(), INITIAL_STORAGE_RIDE);
    }

    private _deleteStorageRide(id: number): boolean {
        if (!this._getStorageRide(this._id)) {
            return false;
        }

        storage.setCollectionValue("rides", id.toString(), undefined);
        return true;
    }

    public delete(): boolean {
        // this.players.spendMoney(playerHash, -this.rideProperties[id].previousTotalProfit);
        return this._deleteStorageRide(this._id);
    }

    public setName(player: IPlayer): void {
        const setName = (name: string, num: number): void => {
            context.executeAction('ridesetname', {
                ride: this._id,
                name: `${name} ${num}`
            }, (result) => {
                if (result.error === 1 && num < 50) {
                    setName(name, num + 1);
                }
            });
        };

        setName(`${player.networkPlayer().name} ${this._mapRideObj?.name.replace(/[0-9]/g, '').trim()}`, 1);
    }
}