import {PlayerManager} from "@manager/PlayerManager";
import {UtilityManager} from "@manager/UtilityManager";
import {RideManager} from "@manager/RideManager";
import {EconomyManager} from "@manager/EconomyManager";
import {PermissionManager} from "@manager/PermissionManager";

import {Messenger} from "@services/Messenger";
import {Commander} from "@services/Commander";

export const start = (): void => {
    if (network.mode !== "server") {
        return;
    }

    const messenger = new Messenger();
    const commander = new Commander();

    const playerManager = new PlayerManager({
        messenger,
    });

    const rideManager = new RideManager({
        playerManager,
    });

    new EconomyManager({
        playerManager,
        rideManager,
        messenger,
        commander,
    });
    new PermissionManager({
        playerManager,
        messenger
    });
    new UtilityManager();
};
