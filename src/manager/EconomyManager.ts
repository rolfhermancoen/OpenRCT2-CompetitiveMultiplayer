import currency from 'currency.js';
import {PlayerManager} from '@src/manager/PlayerManager';
import {RideManager} from '@src/manager/RideManager';
import {ACTION_TYPE, HOOK_TYPE} from "@lib/enum";
import {Messenger} from "@services/Messenger";
import {Commander} from "@services/Commander";
import {Cheater} from "@services/Cheater";

let instantiated = false;

interface EconomyManagerOptions {
    messenger: Messenger
    commander: Commander
    cheater: Cheater
    playerManager: PlayerManager
    rideManager: RideManager
}

const INITIAL_BALANCE = 200000;
const CMD_BALANCE = new RegExp('^balance($| )');
const CMD_BALANCE_SHORT = new RegExp('^bal($| )');
const BUILD_ACTIONS = [
    ACTION_TYPE.BANNER_PLACE,
    ACTION_TYPE.BANNER_REMOVE,
    ACTION_TYPE.CLEAR_SCENERY,
    ACTION_TYPE.FOOTPATH_PLACE,
    ACTION_TYPE.FOOTPATH_REMOVE,
    ACTION_TYPE.LAND_BUY_RIGHTS,
    ACTION_TYPE.LAND_LOWER,
    ACTION_TYPE.LAND_RAISE,
    ACTION_TYPE.LARGE_SCENERY_PLACE,
    ACTION_TYPE.LARGE_SCENERY_REMOVE,
    ACTION_TYPE.MAZE_PLACE_TRACK,
    ACTION_TYPE.MAZE_SET_TRACK,
    ACTION_TYPE.RIDE_CREATE,
    ACTION_TYPE.RIDE_DEMOLISH,
    ACTION_TYPE.SMALL_SCENERY_PLACE,
    ACTION_TYPE.SMALL_SCENERY_REMOVE,
    ACTION_TYPE.SURFACE_SET_STYLE,
    ACTION_TYPE.TILE_MODIFY,
    ACTION_TYPE.TRACK_DESIGN,
    ACTION_TYPE.TRACK_PLACE,
    ACTION_TYPE.TRACK_REMOVE,
    ACTION_TYPE.WALL_PLACE,
    ACTION_TYPE.WALL_REMOVE,
    ACTION_TYPE.WATER_LOWER,
    ACTION_TYPE.WATER_RAISE
];


/**
 * Class representing a manager for all economy functionalities.
 * @class
 */
export class EconomyManager {
    /**
     * messenger service used throughout the manager
     * @private
     * @type {Messenger}
     */
    messenger: Messenger;
    /**
     * commander service used to execute commands
     * @private
     * @type {Commander}
     */
    commander: Commander;
    /**
     * cheater service used to cheat with
     * @private
     * @type {Cheater}
     */
    cheater: Cheater;
    /**
     * a manager which allows the EconomyManager to alter and get players
     * @private
     * @type {PlayerManager}
     */
    playerManager: PlayerManager;
    /**
     * a manager which allows the EconomyManager to alter and get rides
     * @private
     * @type {RideManager}
     */
    rideManager: RideManager;

    /**
     * Construct a new EconomyManager and checks if none has been instantiated yet, then runs the init function
     *
     * @public
     * @param {EconomyManagerOptions} options - the options provided when instantiating
     * @return {EconomyManager}
     */
    constructor(options: EconomyManagerOptions) {
        if(instantiated) {
            throw new Error("UtilityManager can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;

        this.messenger = options.messenger;
        this.commander = options.commander;
        this.cheater = options.cheater;
        this.playerManager = options.playerManager;
        this.rideManager = options.rideManager;
        this.init();
    }

    /**
     * Runs functions on initialization
     *
     * @private
     * @return {void}
     */
    private init(): void {
        this.watchNetworkChat();
        this.watchActionQuery();
        this.watchIntervalDay();
    }

    /**
     * Watches for chatting in the network, and handles them
     *
     * @private
     * @return {void}
     */
    private watchNetworkChat(): void {
        context.subscribe(HOOK_TYPE.NETWORK_CHAT, (event) => {
            const {message, player} = event;
            const command = this.commander.getCommand(message);

            if (typeof command === "boolean") {
                return;
            }

            let responseMessage: string | null = null;

            if ((this.commander.doesCommandMatch(command, [CMD_BALANCE, CMD_BALANCE_SHORT])) !== false) {
                responseMessage = `{YELLOW}Your current balance is: {GREEN}${EconomyManager.formatProfit(this.getPlayerBalance(player) ?? 0)}`;
            }

            if (responseMessage === null) {
                return;
            }

            context.setTimeout(() => this.messenger.message(responseMessage as string, player), 100);
        });
    }

    /**
     * Watches for the interval in the days and fires other functions
     *
     * @private
     * @return {void}
     */
    private watchIntervalDay(): void {
        context.subscribe(HOOK_TYPE.INTERVAL_DAY, () => {
            if (park.cash <= 0) {
                this.setParkBalance(INITIAL_BALANCE);
            }

            if (date.day === 1) {
                this.broadcastMostProfitableRide();
            }
        });
    }

    /**
     * Watches actions by the player
     *
     * @private
     * @return {void}
     */
    private watchActionQuery(): void {
        context.subscribe(HOOK_TYPE.ACTION_QUERY, (event) => {
            const {result, player, action} = event;

            if (!('cost' in result) || !result.cost || result.cost < 0 || player === -1) {
                return;
            }

            const playerBalance = this.getPlayerBalance(player);

            if (playerBalance && BUILD_ACTIONS.indexOf(action as ACTION_TYPE) >= 0) {
                this.setParkBalance(playerBalance);
            }

            if (playerBalance && playerBalance < result.cost && result.cost > 0) {
                this.messenger.message(`{RED}ERROR: Not enough cash to perform that action! It costs ${EconomyManager.formatProfit(result.cost)} and you have ${EconomyManager.formatProfit(playerBalance)}`, player);
                event.result = {
                    error: 1,
                    errorTitle: 'NOT ENOUGH CASH MONEY',
                    errorMessage: 'Can\'t afford to perform action'
                };
                return;
            }

            this.spendMoney(player, result.cost);
        });
    }


    /**
     * Broadcasts the most profitable ride
     *
     * @private
     * @return {void}
     */
    private broadcastMostProfitableRide(): void {
        let mostProfitableRide = {
            id: 0,
            name: '',
            profit: 0
        };

        let message = '';

        for (const ride of map.rides) {
            const profit = this.getRideProfitDifference(ride.id);

            if (profit > mostProfitableRide.profit) {
                mostProfitableRide = {
                    id: ride.id,
                    name: ride.name,
                    profit
                };
            }
        }

        if (mostProfitableRide.profit > 0) {
            const {name} = this.playerManager.getPlayerByRide(mostProfitableRide.id) ?? {};
            message += `{YELLOW}This month's most profitable ride is {WHITE}${mostProfitableRide.name}{YELLOW} by {WHITE}${name}{YELLOW} with a profit of {GREEN}${EconomyManager.formatProfit(mostProfitableRide.profit)}{YELLOW}!`;
        }

        if (message === '') {
            return;
        }

        this.messenger.broadcast(message);
    }

    /**
     * Gets the players balance of a player
     *
     * @private
     * @param {number} id - id of the player
     * @return {number | null}
     */
    private getPlayerBalance(id: number): number | null {
        const player = this.playerManager.getPlayer(id);

        if (!player) {
            return null;
        }

        const playerProfit = this.getPlayerProfit(id);

        return INITIAL_BALANCE - player.moneySpent + (playerProfit !== null ? playerProfit : 0);
    }

    /**
     * Gets the players profit of a player
     *
     * @private
     * @param {number} id - id of the player
     * @return {number | null}
     */
    private getPlayerProfit(id: number): number | null {
        const player = this.playerManager.getPlayer(id);

        if (!player) {
            return null;
        }

        let profit = 0;
        for (const rideID of player.rides) {
            const rideProfit = this.getRideProfit(rideID);
            profit += (rideProfit !== null ? rideProfit : 0);
        }
        return profit;

    }

    /**
     * Gets the profit of a ride
     *
     * @private
     * @param {number} id - id of the ride
     * @return {number | null}
     */
    private getRideProfit(id: number): number | null {
        const {totalProfit, type} = this.rideManager.getRide(id) ?? {};

        if (totalProfit === undefined || !type) {
            return null;
        }

        return Math.max(totalProfit, (type === 36) ? 0 : totalProfit);
    }

    /**
     * Gets the profit difference based on the previousTotalProfit in the rideStorage object
     *
     * @private
     * @param {number} id - id of the player
     * @return {number}
     */
    private getRideProfitDifference(id: number): number {
        const {totalProfit, previousTotalProfit} = this.rideManager.getRide(id) ?? {};

        if (totalProfit === undefined || previousTotalProfit === undefined) {
            return 0;
        }

        this.rideManager.updateStorageRide(id, "previousTotalProfit", totalProfit);
        return totalProfit - previousTotalProfit;
    }

    /**
     * Sets the park balance
     *
     * @private
     * @param {number} value - the value to set the park balance on
     * @return {void}
     */
    private setParkBalance(value: number): void {
        this.cheater.setCheat(17, Math.max(value, INITIAL_BALANCE));
    }

    /**
     * Spends money for a player
     *
     * @private
     * @param {number | string} idOrHash - the id or hash of the player to deduct money from
     * @param {number} cost - the cost of the expenditure
     * @return {void}
     */
    private spendMoney(idOrHash: number | string, cost: number): void {
        const {moneySpent} = this.playerManager.getPlayer(idOrHash) ?? {};

        if (moneySpent === undefined) {
            return;
        }

        this.playerManager.updateStoragePlayer(idOrHash, "moneySpent", moneySpent + cost);
    }

    /**
     * Formats a number to better reflect the in-game display of currency
     *
     * @static
     * @param {number} profit - the number to format
     * @return {string}
     */
    static formatProfit(profit: number): string {
        const profitString = profit.toString();
        const profitSpliced = profitString.substring(0, profitString.length - 1) + "." + profitString.substring(profitString.length - 1, profitString.length);

        return currency(profitSpliced).format();
    }



}