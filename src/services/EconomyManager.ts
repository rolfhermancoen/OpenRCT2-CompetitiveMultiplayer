import {BaseManager} from "./BaseManager";
import {PlayerManager} from "./PlayerManager";
import {RideManager} from "./RideManager";

interface EconomyManagerOptions {
    playerManager: PlayerManager
    rideManager: RideManager
}

const INITIAL_BALANCE = 200000;
const CMD_BALANCE = new RegExp('^balance($| )');
const CMD_BALANCE_SHORT = new RegExp('^bal($| )');
const BUILD_ACTIONS = [
    'bannerplace',
    'bannerremove',
    'clearscenery',
    'footpathplace',
    'footpathplacefromtrack',
    'foothpathremove',
    'footpathsceneryplace',
    'footpathsceneryremove',
    'landbuyrights',
    'landlower',
    'landraise',
    'largesceneryplace',
    'largesceneryremove',
    'mazeplacetrack',
    'mazesettrack',
    'parkmarketing',
    'parksetloan',
    'ridecreate',
    'ridedemolish',
    'smallsceneryplace',
    'smallsceneryremove',
    'surfacesetstyle',
    'tilemodify',
    'trackdesign',
    'trackplace',
    'trackremove',
    'wallplace',
    'wallremove',
    'waterlower',
    'waterraise'
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
        this.listenForCommands();
        this.listenForQuery();
        this.resetParkBalance();
        this.broadcastMostProfitableRide();
    }

    listenForCommands(): void {
        context.subscribe("network.chat", (event) => {
            const {message, player} = event;
            const command = this.getCommand(message);

            if (typeof command === "boolean") {
                return;
            }

            let responseMessage: string | null = null;

            if ((this.doesCommandMatch(command, [CMD_BALANCE, CMD_BALANCE_SHORT])) !== false) {
                responseMessage = `{TOPAZ}Your current balance is: {WHITE}${EconomyManager.formatProfit(this.getPlayerBalance(player) ?? 0)}`;
            }

            if (responseMessage !== null) {
                context.setTimeout(() => network.sendMessage(responseMessage as string, [player]), 100);
            }


        });
    }

    listenForQuery(): void {
        context.subscribe("action.query", (event) => {
            const {result, player, action} = event;

            if (!('cost' in result) || !result.cost || result.cost < 0 || player === -1) {
                return;
            }

            const playerBalance = this.getPlayerBalance(player);

            if (playerBalance && BUILD_ACTIONS.indexOf(action) >= 0) {
                this.setParkBalance(playerBalance);
            }

            if (playerBalance && playerBalance < result.cost && result.cost > 0) {
                network.sendMessage(`{RED}ERROR: Not enough cash to perform that action! It costs ${EconomyManager.formatProfit(result.cost)} and you have ${EconomyManager.formatProfit(playerBalance)}`, [player]);
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

    resetParkBalance(): void {
        context.subscribe("interval.day", () => {
            if (park.cash <= 0) {
                this.setParkBalance(INITIAL_BALANCE);
            }
        });
    }

    broadcastMostProfitableRide(): void {
        context.subscribe("interval.day", () => {
            if (date.day !== 1) {
                return;
            }

            let mostProfitableRide = {
                name: '',
                player: '',
                profit: 0
            };

            let message = '';

            for (const ride of map.rides) {
                const profit = this.getRideProfitDifference(ride.id);

                if (profit > mostProfitableRide.profit) {

                    mostProfitableRide = {
                        name: ride.name,
                        player: "",
                        profit
                    };
                }
            }

            if (mostProfitableRide.profit > 0) {
                message += `{YELLOW}This month's most profitable ride is {WHITE}${mostProfitableRide.name}{YELLOW} by {WHITE}${mostProfitableRide.player}{YELLOW} with a profit of {WHITE}${EconomyManager.formatProfit(mostProfitableRide.profit)}{YELLOW}!`;
            }

            if (message != '') {
                network.sendMessage(message);
            }


        });
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
        const profitSpliced = profitString.substring(0, profitString.length - 1) + "." + profitString.substring(profitString.length - 1, profitString.length) + "0";

        return "$" + profitSpliced;
    }

    spendMoney(idOrHash: number | string, cost: number): void {
        const player = this.playerManager.getPlayer(idOrHash);

        this.playerManager.updateStoragePlayer(idOrHash, "moneySpent", player.moneySpent + cost);
    }

}