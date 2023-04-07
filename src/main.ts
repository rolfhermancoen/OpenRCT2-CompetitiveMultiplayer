import {PlayerManager} from "@src/manager/PlayerManager";
import {UtilityManager} from "@src/manager/UtilityManager";
import {RideManager} from "@src/manager/RideManager";
import {EconomyManager} from "@src/manager/EconomyManager";
import {PermissionManager} from "@src/manager/PermissionManager";
import {Messenger} from "@services/Messenger";
import {Commander} from "@services/Commander";
import {Cheater} from "@services/Cheater";
import {Logger} from "@services/Logger";

export const main = (): void => {
    if (network.mode !== "server") {
        return;
    }

    const messenger = new Messenger();
    const commander = new Commander();
    const cheater = new Cheater();
    const logger = new Logger();

    const playerManager = new PlayerManager({
        messenger,
        logger,
    });

    const rideManager = new RideManager({
        playerManager,
        logger,
    });

    new EconomyManager({
        playerManager,
        rideManager,
        messenger,
        commander,
        cheater
    });
    new PermissionManager({
        playerManager,
        messenger
    });
    new UtilityManager({
        cheater
    });
};
