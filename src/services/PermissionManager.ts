import {BaseManager} from "./BaseManager";
import {PlayerManager} from "./PlayerManager";

const TILE_WIDTH = 32;

type PermissionManagerOptions = {
    playerManager: PlayerManager
};

export class PermissionManager extends BaseManager {
    private playerManager: PlayerManager;

    constructor(options: PermissionManagerOptions) {
        super();
        this.playerManager = options.playerManager;
    }

    override init(): void {
        this.listenForQuery();
    }


    listenForQuery(): void {
        context.subscribe("action.query", (event) => {
            const {action, args, player} = event;

            if (action === "ridecreate") {
                return;
            }

            if (action === "parksetparameter" || action === "parksetname" || action === "parksetentrancefee" || action === "landbuyrights" || action === "parksetloan" || action === "parkmarketing" || action === "parksetresearchfunding") {
                const foundPlayer = this.playerManager.getPlayer(player);
                if (!foundPlayer || !this.isAdmin(foundPlayer)) {
                    event.result = {
                        error: 1,
                        errorTitle: 'NOT ALLOWED',
                        errorMessage: 'Only admins can close or open the park.'
                    };
                    network.sendMessage('{RED}ERROR: Only admins can modify the park!', [player]);
                }
            }

            this.fixAction(event);

            if ('ride' in args && player >= 0) {
                const foundPlayer = this.playerManager.getPlayer(player);

                if (!foundPlayer.rides.some((ride) => ride === <number>args["ride"]) && !this.isAdmin(foundPlayer)) {
                    event.result = {
                        error: 1,
                        errorTitle: 'NOT OWNED',
                        errorMessage: 'That ride belongs to another player.'
                    };
                    network.sendMessage('{RED}ERROR: {WHITE}That ride/stall doesn\'t belong to you!', [player]);

                }
            }
        });
    }


    fixAction(event: GameActionEventArgs): void {
        const {action, args} = event;

        if (action !== "trackremove" || !('x' in args) || !('y' in args) || !('z' in args) || !('ride' in event.args)) {
            return;
        }


        const tile = map.getTile(args["x"] as number / TILE_WIDTH, args["y"] as number / TILE_WIDTH);

        for (let i = 0; i < tile.numElements; i++) {
            const element = tile.getElement(i);
            if (element.type === "track" && element.baseZ === args["z"] as number) {
                event.args["ride"] = element.ride;
                break;
            }
        }
    }


    isAdmin(player: { group: number}): boolean {
        const {permissions}: PlayerGroup = network.getGroup(player.group);
        return permissions.indexOf("kick_player") >= 0;
    }
}