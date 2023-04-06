import {PlayerManager} from "@services/PlayerManager";
import {UtilityManager} from "@services/UtilityManager";
import {RideManager} from "@services/RideManager";
import {EconomyManager} from "@services/EconomyManager";
import {PermissionManager} from "@services/PermissionManager";

export const main = (): void => {
    if (network.mode !== "server") {
        return;
    }

    const playerManager = new PlayerManager();
    const rideManager = new RideManager({
        playerManager,
    });

    new EconomyManager({
        playerManager,
        rideManager
    });
    new PermissionManager({
        playerManager,
    });
    new UtilityManager();
};
