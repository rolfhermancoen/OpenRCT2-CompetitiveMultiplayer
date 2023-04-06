import {BaseManager} from "./BaseManager";

export class UtilityManager extends BaseManager {
    constructor() {
        super();
    }

    override init(): void {
        this.disableTrackDesigns();
        this.enableCheats();
    }

    disableTrackDesigns(): void {
        context.subscribe("action.query", (event) => {
            const {player, action} = event;

            if (player === -1 && action === "ridecreate") {
                event.result = {
                    error: 1,
                    errorTitle: 'NO PLAYER INDEX',
                    errorMessage: 'Player is -1'
                };
            }
        });
    }

    enableCheats(): void {
        // disable vandalism
        this.setCheatAction(13);

        // disable plants aging
        this.setCheatAction(25);

        // disable all breakdowns
        this.setCheatAction(9);

        // rides don't decrease in value over time
        this.setCheatAction(43);

        // unlock all rides
        this.setCheatAction(44);

        // clear grass every 1000 ticks
        context.subscribe('interval.tick', () => {
            if (date.ticksElapsed % 10000 === 0) {
                this.setCheatAction(23);
            }
        });
    }
}