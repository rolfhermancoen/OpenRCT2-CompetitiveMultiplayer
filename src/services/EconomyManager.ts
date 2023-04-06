import currency from 'currency.js';
import {BaseManager} from "@services/BaseManager";
import {PlayerManager} from '@services/PlayerManager';
import {RideManager} from '@services/RideManager';
import {ACTION_TYPE, HOOK_TYPE} from "@lib/enum";

interface EconomyManagerOptions {
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


export class EconomyManager extends BaseManager {
    playerManager: PlayerManager;
    rideManager: RideManager;

    constructor(options: EconomyManagerOptions) {
        super();
        this.playerManager = options.playerManager;
        this.rideManager = options.rideManager;
    }

    override init(): void {
        this.watchNetworkChat();
        this.watchActionQuery();
        this.watchIntervalDay();
    }

    watchNetworkChat(): void {
        context.subscribe(HOOK_TYPE.NETWORK_CHAT, (event) => {
            const {message, player} = event;
            const command = this.getCommand(message);

            if (typeof command === "boolean") {
                return;
            }

            let responseMessage: string | null = null;

            if ((this.doesCommandMatch(command, [CMD_BALANCE, CMD_BALANCE_SHORT])) !== false) {
                responseMessage = `{YELLOW}Your current balance is: {GREEN}${EconomyManager.formatProfit(this.getPlayerBalance(player) ?? 0)}`;
            }

            if (responseMessage === null) {
                return;
            }

            context.setTimeout(() => this.broadcast(responseMessage as string, player), 100);
        });
    }

    watchIntervalDay(): void {
        context.subscribe(HOOK_TYPE.INTERVAL_DAY, () => {
            if (park.cash <= 0) {
                this.setParkBalance(INITIAL_BALANCE);
            }

            if (date.day === 1) {
                this.broadcastMostProfitableRide();
            }
        });
    }


    watchActionQuery(): void {
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
                this.broadcast(`{RED}ERROR: Not enough cash to perform that action! It costs ${EconomyManager.formatProfit(result.cost)} and you have ${EconomyManager.formatProfit(playerBalance)}`, player);
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


    broadcastMostProfitableRide(): void {
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
            const player = this.playerManager.getPlayerByRide(mostProfitableRide.id);
            message += `{YELLOW}This month's most profitable ride is {WHITE}${mostProfitableRide.name}{YELLOW} by {WHITE}${player?.name}{YELLOW} with a profit of {GREEN}${EconomyManager.formatProfit(mostProfitableRide.profit)}{YELLOW}!`;
        }

        if (message === '') {
            return;
        }

        this.broadcast(message);
    }

    getPlayerBalance(id: number): number | null {
        const player = this.playerManager.getPlayer(id);

        if (!player) {
            return null;
        }

        const playerProfit = this.getPlayerProfit(id);

        return INITIAL_BALANCE - player.moneySpent + (playerProfit !== null ? playerProfit : 0);
    }

    getPlayerProfit(id: number): number | null {
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

    getRideProfit(id: number): number | null {
        const ride = this.rideManager.getRide(id);

        if (!ride) {
            return null;
        }

        return Math.max(ride.totalProfit, (ride.type === 36) ? 0 : ride.totalProfit);
    }

    getRideProfitDifference(id: number): number {
        const ride = this.rideManager.getRide(id);

        if (ride === null) {
            return 0;
        }

        const profit = ride.totalProfit;
        const previous = ride.previousTotalProfit;

        this.rideManager.updateStorageRide(id, "previousTotalProfit", profit);
        return profit - previous;
    }

    setParkBalance(value: number): void {
        this.setCheatAction(17, Math.max(value, INITIAL_BALANCE));
    }

    static formatProfit(profit: number): string {
        const profitString = profit.toString();
        const profitSpliced = profitString.substring(0, profitString.length - 1) + "." + profitString.substring(profitString.length - 1, profitString.length);

        return currency(profitSpliced).format();
    }

    spendMoney(idOrHash: number | string, cost: number): void {
        const player = this.playerManager.getPlayer(idOrHash);

        if (!player) {
            return;
        }

        this.playerManager.updateStoragePlayer(idOrHash, "moneySpent", player.moneySpent + cost);
    }

}